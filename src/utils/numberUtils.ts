/**
 * Formata um número para o padrão brasileiro (vírgula como separador decimal)
 * @param value O número a ser formatado
 * @param decimalPlaces Número de casas decimais (padrão: 1)
 * @returns String formatada
 */
export const formatNumberBR = (value: number | undefined | null, decimalPlaces: number = 1): string => {
    if (value === undefined || value === null) return '0,0';
    return value.toFixed(decimalPlaces).replace('.', ',');
}; 