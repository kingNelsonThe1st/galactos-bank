"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UploadButton } from "@/lib/uploadthing"
import { Trash2 } from "lucide-react"

// Type for UploadThing response
type UploadFileResponse = {
  name: string
  size: number
  key: string
  url: string
  customId: string | null
  type: string
}

interface ProfilePictureUploadProps {
  currentPicture: string | null
  initials: string
  userName: string
}

export default function ProfilePictureUpload({ 
  currentPicture, 
  initials,
  userName 
}: ProfilePictureUploadProps) {
  const router = useRouter()
  const [uploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleRemovePicture = async () => {
    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to remove picture')
        return
      }
      
      setSuccess('Profile picture removed successfully')
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {error && (
        <div className="w-full rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full rounded-lg bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}
      
      <Avatar className="h-32 w-32">
        <AvatarImage src={currentPicture || undefined} alt={userName} />
        <AvatarFallback className="text-4xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-3">
        <UploadButton
          endpoint="profilePicture"
          onClientUploadComplete={async (res: UploadFileResponse[]) => {
            if (res && res[0]) {
              const fileUrl = res[0].url
              
              // Update user's profile picture in database
              try {
                const response = await fetch('/api/user/profile-picture', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ profilePictureUrl: fileUrl })
                })
                const data = await response.json()
                
                if (!response.ok) {
                  setError(data.error || 'Failed to update picture')
                  return
                }
                
                setSuccess('Profile picture updated successfully!')
                setTimeout(() => {
                  router.refresh()
                }, 1000)
              } catch {
                setError('Failed to update profile picture')
              }
            }
          }}
          onUploadError={(error: Error) => {
            setError(`Upload failed: ${error.message}`)
          }}
          appearance={{
            button: "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium",
            allowedContent: "hidden"
          }}
        />
        {currentPicture && (
          <Button 
            variant="outline" 
            onClick={handleRemovePicture}
            disabled={uploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Supported formats: JPG, PNG, GIF (Max 4MB)
      </p>
    </div>
  )
}