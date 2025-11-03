// Teste específico das CNHs geradas para verificar se estão realmente válidas

function validarCNH(cnh) {
    // Remover qualquer formatação
    cnh = cnh.replace(/\D/g, '');
    
    // Verificar se tem 11 dígitos
    if (cnh.length !== 11) {
        return false;
    }
    
    // Verificar se não são todos iguais
    if (/^(\d)\1{10}$/.test(cnh)) {
        return false;
    }
    
    // Converter para array de números
    const digitos = cnh.split('').map(Number);
    
    // Calcular primeiro dígito verificador
    const fatores1 = [9, 8, 7, 6, 5, 4, 3, 2, 1];
    let soma1 = 0;
    
    for (let i = 0; i < 9; i++) {
        soma1 += digitos[i] * fatores1[i];
    }
    
    let dv1 = soma1 % 11;
    if (dv1 >= 10) {
        dv1 = 0;
    }
    
    // Verificar se o primeiro DV está correto
    if (dv1 !== digitos[9]) {
        return false;
    }
    
    // Calcular segundo dígito verificador
    const fatores2 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let soma2 = 0;
    
    for (let i = 0; i < 9; i++) {
        soma2 += digitos[i] * fatores2[i];
    }
    
    soma2 += dv1 * 2; // Multiplicar o primeiro DV por 2
    
    let dv2 = soma2 % 11;
    if (dv2 >= 10) {
        dv2 = 0;
    }
    
    // Verificar se o segundo DV está correto
    return dv2 === digitos[10];
}

// Testar as CNHs geradas
const cnhsParaTestar = [
    '34567890156',
    '12345678900',
    '23456789022',
    '45678901290',
    '32149540863' // CNH que está no banco de dados
];

console.log('=== TESTE DE VALIDAÇÃO DAS CNHs ===\n');

cnhsParaTestar.forEach(cnh => {
    const ehValida = validarCNH(cnh);
    console.log(`CNH: ${cnh} - ${ehValida ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
    
    if (!ehValida) {
        // Debug detalhado para CNHs inválidas
        const digitos = cnh.split('').map(Number);
        
        // Primeiro DV
        const fatores1 = [9, 8, 7, 6, 5, 4, 3, 2, 1];
        let soma1 = 0;
        for (let i = 0; i < 9; i++) {
            soma1 += digitos[i] * fatores1[i];
        }
        let dv1 = soma1 % 11;
        if (dv1 >= 10) dv1 = 0;
        
        // Segundo DV
        const fatores2 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let soma2 = 0;
        for (let i = 0; i < 9; i++) {
            soma2 += digitos[i] * fatores2[i];
        }
        soma2 += dv1 * 2;
        let dv2 = soma2 % 11;
        if (dv2 >= 10) dv2 = 0;
        
        console.log(`  Debug: ${cnh.substring(0,9)} -> DV calculado: ${dv1}${dv2}, DV informado: ${digitos[9]}${digitos[10]}`);
    }
});

console.log('\n=== VERIFICAÇÃO DA CNH DO BANCO ===');
const cnhBanco = '32149540863';
console.log(`CNH no banco: ${cnhBanco}`);
console.log(`É válida: ${validarCNH(cnhBanco) ? 'SIM' : 'NÃO'}`);