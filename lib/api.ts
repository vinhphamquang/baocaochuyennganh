const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface RegisterData {
  fullName: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: string
  }
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Đăng ký thất bại')
    }

    return result
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Đăng nhập thất bại')
    }

    return result
  },

  getMe: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi lấy thông tin người dùng')
    }

    return result
  },
}

export const certificateAPI = {
  upload: async (file: File, token: string) => {
    const formData = new FormData()
    formData.append('certificate', file)

    const response = await fetch(`${API_URL}/certificates/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi tải lên file')
    }

    return result
  },

  getAll: async (token: string) => {
    const response = await fetch(`${API_URL}/certificates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi lấy danh sách chứng chỉ')
    }

    return result
  },

  getById: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/certificates/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi lấy thông tin chứng chỉ')
    }

    return result
  },
}

export interface CommentData {
  content: string
  rating: number
}

export interface Comment {
  _id: string
  userId: string
  userName: string
  userEmail: string
  content: string
  rating: number
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export const commentAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lấy danh sách bình luận')
      }

      return result
    } catch (error: any) {
      // Xử lý lỗi network một cách graceful
      console.warn('API comments không khả dụng:', error.message)
      
      // Trả về dữ liệu mock để trang web vẫn hoạt động
      return {
        success: true,
        data: []
      }
    }
  },

  create: async (data: CommentData, token: string) => {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi tạo bình luận')
    }

    return result
  },

  delete: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi khi xóa bình luận')
    }

    return result
  },
}