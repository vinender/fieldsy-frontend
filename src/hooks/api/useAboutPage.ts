import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface AboutPageData {
  heroSection: {
    sectionTitle: string
    mainTitle: string
    subtitle?: string
    description: string
    buttonText: string
    image: string
    stats: Array<{
      value: string
      label: string
      order: number
    }>
  }
  missionSection: {
    title: string
    description: string
    buttonText?: string
    image?: string
  }
  whoWeAreSection: {
    title: string
    description: string
    mainImage?: string
    rightCardImage?: string
    rightCardTitle?: string
    rightCardDescription?: string
    features: Array<{
      icon: string
      title: string
      description: string
      order: number
    }>
  }
  whatWeDoSection: {
    title: string
    subtitle?: string
    description: string
    image: string
    features: Array<{
      title: string
      description: string
      order: number
    }>
  }
  whyFieldsySection: {
    title: string
    subtitle?: string
    image?: string
    boxTitle?: string
    boxDescription?: string
    buttonText?: string
    features: Array<{
      icon: string
      title: string
      description: string
      order: number
    }>
  }
  _id?: string
  createdAt?: string
  updatedAt?: string
}

// Fetch About Page content
export const useAboutPage = () => {
  return useQuery({
    queryKey: ['aboutPage'],
    queryFn: async (): Promise<AboutPageData> => {
      const { data } = await axios.get(`${API_URL}/about-page`)
      return data.data
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

// Update entire About Page content
export const useUpdateAboutPage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Partial<AboutPageData>) => {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        `${API_URL}/about-page`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutPage'] })
    },
  })
}

// Update specific section
export const useUpdateAboutSection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      section, 
      updates 
    }: { 
      section: 'heroSection' | 'missionSection' | 'whoWeAreSection' | 'whatWeDoSection' | 'whyFieldsySection'
      updates: any 
    }) => {
      const token = localStorage.getItem('token')
      const { data } = await axios.put(
        `${API_URL}/about-page/section/${section}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutPage'] })
    },
  })
}