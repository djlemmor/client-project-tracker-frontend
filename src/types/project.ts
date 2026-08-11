export interface Project {
  id: number
  client_name: string
  project_name: string
  description: string | null
  status: string
  priority: string
  start_date: string | null
  due_date: string | null
}
