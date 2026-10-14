export interface DownloadHistoryItem {
  id: string
  source_url: string
  platform: string
  title: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  format: string
  quality: string
  created_at: string
  completed_at: string | null
}

export interface DownloadJobStatus {
  id: string
  status: DownloadHistoryItem['status']
  progress: number | null
  downloaded_bytes?: number | null
  total_bytes?: number | null
  error: string | null
}

export interface DownloadJobCreated {
  id: string
  status: 'pending'
}