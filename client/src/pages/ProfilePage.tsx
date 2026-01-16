import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth.api'
import { exportApi, ExportData } from '@/api/export.api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { formatDate } from '@/utils/formatters'
import { Download, Upload, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const updated = await authApi.updateProfile({ displayName, username })
      updateUser(updated)
      showToast('success', 'Profile updated successfully!')
    } catch {
      showToast('error', 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match')
      return
    }

    setIsChangingPassword(true)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      showToast('success', 'Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showToast('error', 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportApi.exportData()
      exportApi.downloadAsFile(data, `climbing-journal-${user?.username}-${new Date().toISOString().split('T')[0]}.json`)
      showToast('success', 'Data exported successfully!')
    } catch {
      showToast('error', 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const data: ExportData = JSON.parse(text)
      const result = await exportApi.importData(data)
      showToast('success', `Imported ${result.imported.locations} locations, ${result.imported.routes} routes, ${result.imported.climbs} climbs`)
    } catch {
      showToast('error', 'Failed to import data')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await authApi.changePassword({ currentPassword: '', newPassword: '' }).catch(() => {})
      // Would need to implement delete endpoint
      showToast('info', 'Account deletion not yet implemented')
      setShowDeleteModal(false)
    } catch {
      showToast('error', 'Failed to delete account')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-rock-900">Profile</h1>
        <p className="text-rock-600">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-rock-900">Profile Information</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={user?.profilePicture} name={user?.displayName} size="xl" />
              <div>
                <p className="font-medium text-rock-900">{user?.displayName}</p>
                <p className="text-sm text-rock-500">@{user?.username}</p>
                <p className="text-xs text-rock-400">Member since {formatDate(user?.createdAt || '')}</p>
              </div>
            </div>

            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              className="bg-rock-50"
            />

            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-rock-900">Change Password</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button type="submit" isLoading={isChangingPassword}>
              Change Password
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-rock-900">Data Management</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-rock-900">Export Data</p>
                <p className="text-sm text-rock-500">Download all your climbing data as JSON</p>
              </div>
              <Button variant="secondary" onClick={handleExport} isLoading={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-rock-900">Import Data</p>
                <p className="text-sm text-rock-500">Import climbing data from a JSON file</p>
              </div>
              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
                <Button variant="secondary" as="span" className="cursor-pointer" disabled={isImporting}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import'}
                </Button>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-fall/50">
        <CardHeader>
          <h3 className="font-semibold text-fall">Danger Zone</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-rock-900">Delete Account</p>
              <p className="text-sm text-rock-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete My Account
          </Button>
        </div>
      </Modal>
    </div>
  )
}
