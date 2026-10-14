export interface MediaFormat {
  format: string
  quality: string
  extension?: string | null
  resolution?: string | null
  filesize?: number | null
  video_codec?: string | null
  audio_codec?: string | null
}

export interface MediaAnalyzeRequest {
  url: string
}

export interface MediaAnalyzeResponse {
  success: boolean
  platform: string
  extractor: string | null
  requires_authorization: boolean
  title: string | null
  duration: string | null
  thumbnail: string | null
  webpage_url?: string | null
  uploader?: string | null
  available_formats: MediaFormat[]
}
