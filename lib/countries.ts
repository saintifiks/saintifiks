// Daftar negara (nama Bahasa Indonesia) untuk pemilih lokasi di Drawer.
// Dipakai accordion "Cari Negara" — dikelompokkan A–Z di komponen Drawer.
// Catatan: ini hanya data nama negara untuk UI pemilih relevansi konten.

export const COUNTRIES: string[] = [
  'Afganistan', 'Afrika Selatan', 'Albania', 'Aljazair', 'Amerika Serikat',
  'Andorra', 'Angola', 'Arab Saudi', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan',
  'Bahama', 'Bahrain', 'Bangladesh', 'Barbados', 'Belanda', 'Belarus',
  'Belgia', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia dan Herzegovina',
  'Botswana', 'Brasil', 'Britania Raya', 'Brunei Darussalam', 'Bulgaria',
  'Burkina Faso', 'Burundi',
  'Chad', 'Chili', 'Tiongkok',
  'Denmark', 'Djibouti', 'Dominika',
  'Ekuador', 'El Salvador', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Filipina', 'Finlandia',
  'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Guatemala', 'Guinea',
  'Guinea Khatulistiwa', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hongaria',
  'India', 'Indonesia', 'Irak', 'Iran', 'Irlandia', 'Islandia', 'Israel',
  'Italia',
  'Jamaika', 'Jepang', 'Jerman', 'Jordania',
  'Kamboja', 'Kamerun', 'Kanada', 'Kazakhstan', 'Kenya', 'Kirgizstan',
  'Kiribati', 'Kolombia', 'Komoro', 'Korea Selatan', 'Korea Utara',
  'Kosta Rika', 'Kroasia', 'Kuba', 'Kuwait',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
  'Liechtenstein', 'Lituania', 'Luksemburg',
  'Madagaskar', 'Makedonia Utara', 'Maladewa', 'Malawi', 'Malaysia',
  'Mali', 'Malta', 'Maroko', 'Mauritania', 'Mauritius', 'Meksiko',
  'Mesir', 'Moldova', 'Monako', 'Mongolia', 'Montenegro', 'Mozambik',
  'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Niger', 'Nigeria', 'Nikaragua', 'Norwegia',
  'Oman',
  'Pakistan', 'Palau', 'Palestina', 'Panama', 'Pantai Gading',
  'Papua Nugini', 'Paraguay', 'Perancis', 'Peru', 'Polandia', 'Portugal',
  'Qatar',
  'Republik Ceko', 'Republik Demokratik Kongo', 'Republik Dominika',
  'Republik Kongo', 'Rumania', 'Rusia', 'Rwanda',
  'Saint Lucia', 'Samoa', 'San Marino', 'Selandia Baru', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapura', 'Siprus', 'Slovakia',
  'Slovenia', 'Somalia', 'Spanyol', 'Sri Lanka', 'Sudan', 'Sudan Selatan',
  'Suriah', 'Suriname', 'Swedia', 'Swiss',
  'Tajikistan', 'Tanjung Verde', 'Tanzania', 'Thailand', 'Timor Leste',
  'Togo', 'Tonga', 'Trinidad dan Tobago', 'Tunisia', 'Turki',
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraina', 'Uni Emirat Arab', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Venezuela', 'Vietnam',
  'Yaman', 'Yunani',
  'Zambia', 'Zimbabwe',
]

// Kelompokkan negara berdasarkan huruf awal (A–Z), untuk daftar accordion.
export function groupCountriesByLetter(
  list: string[] = COUNTRIES
): { letter: string; items: string[] }[] {
  const sorted = [...list].sort((a, b) => a.localeCompare(b, 'id'))
  const map = new Map<string, string[]>()
  for (const name of sorted) {
    const letter = name.charAt(0).toUpperCase()
    if (!map.has(letter)) map.set(letter, [])
    map.get(letter)!.push(name)
  }
  return Array.from(map.entries()).map(([letter, items]) => ({ letter, items }))
}
