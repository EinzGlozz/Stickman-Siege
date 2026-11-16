#!/usr/bin/env python3
"""Build/sign the offline APK with official SDK tools, without Gradle or npm."""
from pathlib import Path
import hashlib
import json
import os
import re
import secrets
import shutil
import subprocess
import zipfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
WEB = ROOT / 'dist'
BUILD = HERE / 'build'
TOOLS = HERE / 'toolchain' / 'android-15'
PLATFORM = HERE / 'toolchain' / 'android-35' / 'android.jar'
PRIVATE = HERE / 'private'
OUTPUT = ROOT / 'downloads' / 'Stickman-Siege-Android.apk'
KEY = PRIVATE / 'stickman-siege.p12'
PASSWORD = PRIVATE / 'signing.pass'


def run(args, capture=False):
    result = subprocess.run([str(x) for x in args], check=True, text=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout if capture else None


def java_bin():
    candidates = []
    if os.environ.get('JAVA_HOME'):
        candidates.append(Path(os.environ['JAVA_HOME']) / 'bin')
    candidates += [Path('/opt/homebrew/opt/openjdk/bin')]
    java_path = shutil.which('java')
    if java_path:
        candidates.append(Path(java_path).parent)
    for candidate in candidates:
        if all((candidate / tool).exists() for tool in ('java', 'javac', 'keytool')):
            return candidate
    raise SystemExit('Ein Java-JDK wird benötigt; ggf. JAVA_HOME setzen.')


def main():
    if not PLATFORM.exists() or not (TOOLS / 'aapt2').exists():
        raise SystemExit('Android SDK 35 fehlt. Siehe README-ANDROID.md.')
    jdk = java_bin()
    BUILD.mkdir(parents=True, exist_ok=True)
    PRIVATE.mkdir(parents=True, exist_ok=True)
    PRIVATE.chmod(0o700)
    for executable in ('aapt2', 'zipalign'):
        (TOOLS / executable).chmod(0o755)
    assets = BUILD / 'assets' / 'www'
    assets.mkdir(parents=True, exist_ok=True)
    source_files = ['index.html', 'core.js', 'game.js', 'style.css', 'icon.svg',
                    'icon-192.png', 'icon-512.png', 'manifest.webmanifest']
    for name in source_files:
        shutil.copy2(WEB / name, assets / name)
    # The native app already bundles every file; no web Service Worker is needed.
    html = (assets / 'index.html').read_text()
    html, count = re.subn(r"<script>if\('serviceWorker'.*?</script>", '', html, flags=re.S)
    if count != 1:
        raise SystemExit('Service-Worker-Startstelle geändert; Asset-Aufbereitung prüfen.')
    (assets / 'index.html').write_text(html)
    resources = BUILD / 'res'
    shutil.copytree(HERE / 'res', resources, dirs_exist_ok=True)
    (resources / 'drawable-nodpi').mkdir(exist_ok=True)
    shutil.copy2(WEB / 'icon-512.png', resources / 'drawable-nodpi' / 'ic_launcher.png')
    compiled = BUILD / 'resources.zip'
    run([TOOLS / 'aapt2', 'compile', '--dir', resources, '-o', compiled])
    unsigned = BUILD / 'unsigned.apk'
    run([TOOLS / 'aapt2', 'link', '-I', PLATFORM, '--manifest', HERE / 'AndroidManifest.xml',
         '--min-sdk-version', '26', '--target-sdk-version', '35', '-A', BUILD / 'assets',
         '-o', unsigned, compiled])
    classes = BUILD / 'classes'
    classes.mkdir(exist_ok=True)
    sources = sorted((HERE / 'src').rglob('*.java'))
    run([jdk / 'javac', '--release', '8', '-classpath', PLATFORM,
         '-encoding', 'UTF-8', '-d', classes, *sources])
    class_jar = BUILD / 'classes.jar'
    with zipfile.ZipFile(class_jar, 'w', zipfile.ZIP_DEFLATED) as archive:
        for source in sorted(classes.rglob('*.class')):
            archive.write(source, source.relative_to(classes))
    dex = BUILD / 'dex'
    dex.mkdir(exist_ok=True)
    run([jdk / 'java', '-cp', TOOLS / 'lib' / 'd8.jar', 'com.android.tools.r8.D8',
         '--min-api', '26', '--lib', PLATFORM, '--output', dex, class_jar])
    with zipfile.ZipFile(unsigned, 'a', zipfile.ZIP_DEFLATED) as archive:
        for source in sorted(dex.glob('*.dex')):
            archive.write(source, source.name)
    aligned = BUILD / 'aligned.apk'
    run([TOOLS / 'zipalign', '-f', '4', unsigned, aligned])
    if not PASSWORD.exists():
        if KEY.exists():
            raise SystemExit('Passwortdatei zum vorhandenen Schlüssel fehlt. Schlüssel nicht ersetzen!')
        descriptor = os.open(PASSWORD, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, 'w') as stream:
            stream.write(secrets.token_hex(32))
    PASSWORD.chmod(0o600)
    if not KEY.exists():
        run([jdk / 'keytool', '-genkeypair', '-keystore', KEY, '-storetype', 'PKCS12',
             '-storepass:file', PASSWORD, '-alias', 'stickman-siege', '-keyalg', 'RSA',
             '-keysize', '3072', '-validity', '10000',
             '-dname', 'CN=Stickman Siege, O=Local Development', '-noprompt'])
    KEY.chmod(0o600)
    OUTPUT.parent.mkdir(exist_ok=True)
    signer = [jdk / 'java', '-jar', TOOLS / 'lib' / 'apksigner.jar']
    run([*signer, 'sign', '--ks', KEY, '--ks-key-alias', 'stickman-siege',
         '--ks-pass', 'file:' + str(PASSWORD), '--min-sdk-version', '26',
         '--v1-signing-enabled', 'true', '--v2-signing-enabled', 'true',
         '--v3-signing-enabled', 'true', '--v4-signing-enabled', 'false',
         '--out', OUTPUT, aligned])
    verification = run([*signer, 'verify', '--verbose', '--print-certs', OUTPUT], capture=True)
    run([TOOLS / 'zipalign', '-c', '4', OUTPUT])
    metadata = run([TOOLS / 'aapt2', 'dump', 'badging', OUTPUT], capture=True)
    if 'uses-permission:' in metadata:
        raise SystemExit('Unerwartete Android-Berechtigung in der APK!')
    with zipfile.ZipFile(OUTPUT) as archive:
        assert archive.testzip() is None
        assert 'classes.dex' in archive.namelist()
        assert archive.read('assets/www/game.js') == (WEB / 'game.js').read_bytes()
        assert archive.read('assets/www/core.js') == (WEB / 'core.js').read_bytes()
        assert not any('private/' in name or name.endswith(('.pass', '.p12')) for name in archive.namelist())
    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    OUTPUT.with_suffix('.apk.sha256').write_text(digest + '  ' + OUTPUT.name + '\n')
    (BUILD / 'verification.txt').write_text(verification + '\n' + metadata)
    (BUILD / 'build-info.json').write_text(json.dumps({
        'apk': OUTPUT.name, 'sha256': digest, 'bytes': OUTPUT.stat().st_size,
        'minSdk': 26, 'targetSdk': 35, 'package': 'io.github.einzglozz.stickmansiege',
        'sourceBaseCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'gameJsSha256': hashlib.sha256((WEB / 'game.js').read_bytes()).hexdigest(),
        'coreJsSha256': hashlib.sha256((WEB / 'core.js').read_bytes()).hexdigest()
    }, indent=2))
    print(verification)
    print('APK erstellt:', OUTPUT)
    print('Größe:', OUTPUT.stat().st_size, 'Bytes; SHA-256:', digest)


if __name__ == '__main__':
    main()
