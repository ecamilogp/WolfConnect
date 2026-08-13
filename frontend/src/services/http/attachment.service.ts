import { httpClient } from './http-client'
import type { Message } from '@/types/models/message.model'

export async function sendMessageWithAttachment(
  chatId: string,
  content: string,
  file: File,
): Promise<Message> {
  // Axios sets the multipart/form-data Content-Type (with the correct boundary)
  // automatically when the request body is a FormData instance. Setting the
  // header manually here would strip that boundary and break multer's parsing
  // on the backend.
  const formData = new FormData()
  formData.append('file', file)

  if (content.trim().length > 0) {
    formData.append('content', content.trim())
  }

  const response = await httpClient.post<Message>(`/chats/${chatId}/messages/attachments`, formData)
  return response.data
}
