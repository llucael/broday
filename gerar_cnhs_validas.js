// Script para gerar CNHs válidas usando o algoritmo oficial brasileiro

function calcularDigitoVerificadorCNH(cnh9digitos) {
    // Converter para array de números
    const digitos = cnh9digitos.split('').map(Number);
    
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
    
    return dv1.toString() + dv2.toString();
}

// Gerar CNHs válidas
const cnhsValidas = [];

// Bases para gerar CNHs
const bases = [
    '123456789',
    '234567890',
    '345678901',
    '456789012',
    '567890123',
    '678901234',
    '789012345',
    '890123456',
    '901234567',
    '012345678',
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
    '987654321',
    '876543210',
    '765432109',
    '654321098',
    '543210987',
    '432109876',
    '321098765',
    '210987654',
    '109876543',
    '192837465',
    '918273645'
];

console.log('GERANDO CNHs VÁLIDAS...\n');

bases.forEach(base => {
    const dv = calcularDigitoVerificadorCNH(base);
    const cnhCompleta = base + dv;
    cnhsValidas.push(cnhCompleta);
    console.log(cnhCompleta);
});

console.log('\n=== RESUMO ===');
console.log(`Total de CNHs geradas: ${cnhsValidas.length}`);
console.log('\nTodas as CNHs acima são matematicamente válidas!');