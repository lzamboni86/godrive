# Carregar variáveis de ambiente do arquivo .env
$envPath = Join-Path $PSScriptRoot ".." ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$email = "luis.h.zamboni@outlook.com"
$password = "Teste123"

Write-Host "🔍 Verificando usuário: $email"

# Verificar se DATABASE_URL está configurada
$dbUrl = [System.Environment]::GetEnvironmentVariable("DATABASE_URL")
if (-not $dbUrl) {
    Write-Host "❌ DATABASE_URL não encontrada"
    exit 1
}

Write-Host "✅ DATABASE_URL encontrada"

# Conectar ao banco e verificar usuário
try {
    # Usar psql para verificar o usuário
    $query = "SELECT id, name, role, created_at, avatar FROM `"User"` WHERE email = '$email'"
    
    $result = psql $dbUrl -c $query -t -A
    
    if ($result) {
        Write-Host "✅ Usuário encontrado:"
        $result | ForEach-Object {
            $fields = $_ -split '\|'
            Write-Host "- ID: $($fields[0])"
            Write-Host "- Nome: $($fields[1])"
            Write-Host "- Role: $($fields[2])"
            Write-Host "- Criado em: $($fields[3])"
            Write-Host "- Avatar: $($fields[4] -replace '^\s*$')"
        }
    } else {
        Write-Host "❌ Usuário não encontrado no banco"
    }
} catch {
    Write-Host "❌ Erro ao verificar usuário: $_"
}
