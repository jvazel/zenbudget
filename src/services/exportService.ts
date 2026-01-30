import { type Transaction } from '../features/inbox/components/TransactionCard'

export const exportService = {
    /**
     * Converts a list of transactions to a CSV string.
     * Uses semicolon as separator for better Excel compatibility in European locales.
     */
    convertToCSV(transactions: Transaction[]): string {
        const headers = ['Date', 'Description', 'Montant', 'Devise', 'Catégorie', 'Validé par']

        const rows = transactions.map(t => [
            t.raw_date ? new Date(t.raw_date).toLocaleDateString('fr-FR') : t.date,
            `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
            t.amount.toString().replace('.', ','), // Decimal separator as comma for FR
            'EUR',
            t.predicted_category || 'Inconnu',
            t.validated_by_name || 'Moi'
        ])

        return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    },

    /**
     * Triggers a browser download of the given content.
     */
    downloadFile(content: string, fileName: string, contentType: string = 'text/csv;charset=utf-8;') {
        // Add BOM for Excel to recognize UTF-8
        const blob = new Blob(['\ufeff' + content], { type: contentType })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => URL.revokeObjectURL(url), 100)
    }
}
