import { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth.api'
import { exportApi, ExportData } from '@/api/export.api'
import { getErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PageHeader from '@/components/ui/PageHeader'
import PasswordRules from '@/components/auth/PasswordRules'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { formatDate } from '@/utils/formatters'
import { isStrongPassword, validateUsername } from '@/utils/validation'
import { Download, Upload, Trash2, LogOut } from 'lucide-react'
import { UserGradingPreference } from '@/types/models'

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-rock-900">{title}</p>
        <p className="text-sm text-rock-500">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [preferredGradingSystem, setPreferredGradingSystem] = useState<UserGradingPreference>(
    user?.preferredGradingSystem || 'LOCATION_DEFAULT'
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingGrading, setIsUpdatingGrading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [pendingImport, setPendingImport] = useState<{ name: string; data: ExportData } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const usernameError = username !== user?.username ? validateUsername(username) : undefined
  const profileDirty = displayName.trim() !== user?.displayName || username !== user?.username
  const gradingDirty = preferredGradingSystem !== (user?.preferredGradingSystem || 'LOCATION_DEFAULT')
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameError || !displayName.trim()) return
    setIsUpdating(true)

    try {
      const updated = await authApi.updateProfile({ displayName: displayName.trim(), username })
      updateUser(updated)
      showToast('success', 'Profile updated')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateGradingPreference = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingGrading(true)

    try {
      const updated = await authApi.updateProfile({ preferredGradingSystem })
      updateUser(updated)
      showToast('success', 'Grading preference updated')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update grading preference'))
    } finally {
      setIsUpdatingGrading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match')
      return
    }
    if (!isStrongPassword(newPassword)) {
      showToast('error', "New password doesn't meet the requirements")
      return
    }

    setIsChangingPassword(true)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      showToast('success', 'Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to change password'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportApi.exportData()
      exportApi.downloadAsFile(data, `climbing-journal-${user?.username}-${new Date().toISOString().split('T')[0]}.json`)
      showToast('success', 'Export downloaded')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to export data'))
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const data: ExportData = JSON.parse(await file.text())
      setPendingImport({ name: file.name, data })
    } catch {
      showToast('error', "That file isn't valid JSON. Choose a Climb Journal export file.")
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingImport) return
    setIsImporting(true)
    try {
      const result = await exportApi.importData(pendingImport.data)
      showToast(
        'success',
        `Imported ${result.imported.locations} locations, ${result.imported.routes} routes, ${result.imported.climbs} climbs`
      )
      setPendingImport(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to import data'))
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount()
      await logout()
      showToast('info', 'Your account has been deleted')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete account'))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <Card>
        <CardHeader>
          <CardTitle>Profile information</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Avatar src={user?.profilePicture} name={user?.displayName} size="xl" />
              <div className="min-w-0">
                <p className="font-medium text-rock-900 truncate">{user?.displayName}</p>
                <p className="text-sm text-rock-500 truncate">@{user?.username}</p>
                {user?.createdAt && (
                  <p className="text-xs text-rock-400">Member since {formatDate(user.createdAt)}</p>
                )}
              </div>
            </div>

            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              required
              autoComplete="name"
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              error={usernameError}
              maxLength={30}
              required
              autoComplete="username"
            />

            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              hint="Your email can't be changed."
            />

            <div className="flex justify-end">
              <Button type="submit" isLoading={isUpdating} disabled={!profileDirty || !!usernameError}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grading preference</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleUpdateGradingPreference} className="space-y-4">
            <Select
              label="Show grades in"
              value={preferredGradingSystem}
              onChange={(e) => setPreferredGradingSystem(e.target.value as UserGradingPreference)}
              options={[
                { value: 'LOCATION_DEFAULT', label: "Each location's default" },
                { value: 'FRENCH', label: 'Always French (6a, 7b, …)' },
                { value: 'UIAA', label: 'Always UIAA (VI, VIII, …)' },
              ]}
            />
            <p className="text-sm text-rock-500">
              Controls how grades are displayed throughout the app. With "Each location's default",
              grades follow the system configured for each gym or crag.
            </p>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isUpdatingGrading} disabled={!gradingDirty}>
                Save preference
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Hidden username helps password managers attach the new password to the right account. */}
            <input type="text" name="username" autoComplete="username" value={user?.email || ''} readOnly hidden />
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="space-y-2">
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {newPassword && <PasswordRules password={newPassword} />}
            </div>
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={passwordsMismatch ? 'Passwords do not match' : undefined}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isChangingPassword}
                disabled={!currentPassword || !isStrongPassword(newPassword) || newPassword !== confirmPassword}
              >
                Change password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <SettingRow title="Export data" description="Download all your locations, routes, and climbs as JSON.">
            <Button variant="secondary" onClick={handleExport} isLoading={isExporting}>
              {!isExporting && <Download className="w-4 h-4" aria-hidden="true" />}
              Export
            </Button>
          </SettingRow>

          <SettingRow title="Import data" description="Add data from a Climb Journal export file.">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChosen}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={isImporting}>
              {!isImporting && <Upload className="w-4 h-4" aria-hidden="true" />}
              Import
            </Button>
          </SettingRow>

          <SettingRow title="Log out" description="Sign out of Climb Journal on this device.">
            <Button variant="secondary" onClick={() => void logout()}>
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Log out
            </Button>
          </SettingRow>
        </CardBody>
      </Card>

      <Card className="border-fall/40">
        <CardHeader>
          <CardTitle className="!text-fall">Danger zone</CardTitle>
        </CardHeader>
        <CardBody>
          <SettingRow title="Delete account" description="Permanently delete your account and all of your data.">
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Delete account
            </Button>
          </SettingRow>
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={!!pendingImport}
        onClose={() => setPendingImport(null)}
        onConfirm={handleConfirmImport}
        title="Import data?"
        message={
          <>
            Add the contents of <strong className="break-all">{pendingImport?.name}</strong> to your account? Existing data is kept;
            imported items are added alongside it.
          </>
        }
        confirmLabel="Import"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        message="This permanently deletes your account, locations, routes, and climbs. It cannot be undone."
        confirmLabel="Delete my account"
        confirmDisabled={deleteConfirmText !== user?.username}
      >
        <div className="mt-4">
          <Input
            label={`Type your username (${user?.username}) to confirm`}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
