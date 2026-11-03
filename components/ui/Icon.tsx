// Icon — satu-satunya pintu masuk ikon. Ukuran & ketebalan goresan dibakukan di sini;
// komponen lain TIDAK boleh mengimpor 'lucide-react' langsung (dijaga aturan lint).
// Ikon merek (diturunkan dari berlian logo) ada di ./brand-icons.

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Copy,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  Globe,
  Heart,
  Info,
  Link as LinkIcon,
  LoaderCircle,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Pencil,
  PenLine,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingBag,
  Sun,
  Trash2,
  TriangleAlert,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { brandIcons, type BrandIconName } from './brand-icons'
import { CoreIcon, coreIconNames, isCoreIcon, type CoreIconName } from './core-icons'

const libraryIcons = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  bookmark: Bookmark,
  'book-open': BookOpen,
  aa: CaseSensitive,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'circle-check': CircleCheck,
  copy: Copy,
  more: Ellipsis,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  flag: Flag,
  globe: Globe,
  heart: Heart,
  info: Info,
  link: LinkIcon,
  loader: LoaderCircle,
  'log-out': LogOut,
  menu: Menu,
  comment: MessageCircle,
  moon: Moon,
  edit: Pencil,
  write: PenLine,
  plus: Plus,
  search: Search,
  send: Send,
  settings: Settings,
  share: Share2,
  shop: ShoppingBag,
  sun: Sun,
  trash: Trash2,
  warning: TriangleAlert,
  user: User,
  close: X,
} satisfies Record<string, LucideIcon>

export type LibraryIconName = keyof typeof libraryIcons
export type IconName = LibraryIconName | BrandIconName | CoreIconName

export const iconNames = [
  ...coreIconNames,
  ...(Object.keys(libraryIcons).filter((n) => !isCoreIcon(n)) as LibraryIconName[]),
  ...(Object.keys(brandIcons) as BrandIconName[]),
] as IconName[]

// Tiga ukuran baku. 16 = metadata/inline, 20 = tombol, 24 = navigasi/aksi utama.
const sizes = { sm: 16, md: 20, lg: 24 } as const
export type IconSize = keyof typeof sizes

export type IconProps = {
  name: IconName
  size?: IconSize
  // Status aktif untuk toggle (suka, simpan): garis → terisi.
  filled?: boolean
  className?: string
  // Tanpa title ikon bersifat dekoratif (aria-hidden). Beri title bila ikon berdiri sendiri.
  title?: string
}

export default function Icon({ name, size = 'md', filled = false, className = '', title }: IconProps) {
  const px = sizes[size]
  const a11y = title
    ? ({ role: 'img', 'aria-label': title } as const)
    : ({ 'aria-hidden': true } as const)

  if (isCoreIcon(name)) {
    return <CoreIcon name={name} size={px} filled={filled} className={className} {...a11y} />
  }

  if (name in brandIcons) {
    const Brand = brandIcons[name as BrandIconName]
    return <Brand size={px} className={className} {...a11y} />
  }

  const Lib = libraryIcons[name as LibraryIconName]
  return (
    <Lib
      size={px}
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      {...a11y}
    />
  )
}
