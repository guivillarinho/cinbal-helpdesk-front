export interface UserProps {
  id: string | undefined
  name: string | undefined
  sector: string | undefined
  email: string | undefined
  extension: string | undefined
  position: string | undefined
  role: string | undefined
}
export interface FileProps {
  id: string
  filename: string
  mimetype:
    | 'image/jpeg'
    | 'image/gif'
    | 'image/png'
    | 'image/bmp'
    | 'application/pdf'
}

export interface CommentsProps {
  id: string
  message: string
  helpdesk: {
    id: string
  }
  user: {
    name: string
  }
  createdAt: Date
}

export interface HelpDeskProps {
  id: string | undefined
  user: {
    name: string
    sector: string
    role: string
  }
  title: string
  category: string
  description: string
  maxLines: number
  createdAt: Date
  files?: FileProps[]
  comments?: CommentsProps[]
  accountable?: string
}

export interface HelpDeskListProp {
  id: string
  user: {
    name: string
  }
  accountable: string
  title: string
  category: string
  description: string
  files?: File[]
  countFiles: number
  createdAt: Date
}

export default HelpDeskProps
