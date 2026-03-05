param(
  [Parameter(Mandatory=$false)]
  [string]$AdminPassword = "Gerente@NetBank2026!"
)

$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
$rng.GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)

$tmpDir = Join-Path $env:TEMP "netbank-secretgen"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$javaFile = Join-Path $tmpDir "HashGen.java"

$javaSource = @'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode(args[0]));
    }
}
'@
Set-Content -Path $javaFile -Value $javaSource

$crypto = "$env:USERPROFILE\\.m2\\repository\\org\\springframework\\security\\spring-security-crypto\\7.0.2\\spring-security-crypto-7.0.2.jar"
$core = "$env:USERPROFILE\\.m2\\repository\\org\\springframework\\spring-core\\7.0.3\\spring-core-7.0.3.jar"
$jcl = "$env:USERPROFILE\\.m2\\repository\\org\\springframework\\spring-jcl\\6.1.3\\spring-jcl-6.1.3.jar"

& javac -cp "$crypto;$core;$jcl" $javaFile | Out-Null
$adminHash = & java -cp "$tmpDir;$crypto;$core;$jcl" HashGen "$AdminPassword"

Write-Output "JWT_SECRET=$jwtSecret"
Write-Output "ADMIN_PASSWORD_HASH=$adminHash"
