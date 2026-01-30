export interface ImportedTransaction {
    date: string
    description: string
    amount: number
}

export const importService = {
    async parseCSV(fileContent: string): Promise<ImportedTransaction[]> {
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '')
        if (lines.length < 2) return []

        // Header mapping (MVP: search for specific keywords)
        const headers = lines[0].toLowerCase().split(/[;,]/).map(h => h.trim())
        const dateIdx = headers.findIndex(h => h.includes('date'))
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('label'))
        const amountIdx = headers.findIndex(h => h.includes('montant') || h.includes('amoun') || h.includes('valeur'))

        if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
            throw new Error('Format CSV non reconnu. Assurez-vous d\'avoir les colonnes Date, Description et Montant.')
        }

        const separator = lines[0].includes(';') ? ';' : ','

        const results: ImportedTransaction[] = []
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''))
            if (cols.length < headers.length) continue

            const rawAmount = cols[amountIdx].replace(',', '.')
            const amount = parseFloat(rawAmount)

            if (isNaN(amount)) continue

            results.push({
                date: cols[dateIdx],
                description: cols[descIdx],
                amount: amount
            })
        }

        return results
    },

    async parseJSON(fileContent: string): Promise<ImportedTransaction[]> {
        try {
            const data = JSON.parse(fileContent)
            if (!Array.isArray(data)) throw new Error('Format JSON invalide (doit être un tableau)')

            return data.map((item: any) => {
                const amount = parseFloat(item.amount || item.montant)
                return {
                    date: item.date || item.transaction_date,
                    description: item.description || item.label,
                    amount: isNaN(amount) ? 0 : amount
                }
            }).filter(item => item.description && item.date)
        } catch (e) {
            throw new Error('Erreur lors du parsing JSON : ' + (e as Error).message)
        }
    }
}
