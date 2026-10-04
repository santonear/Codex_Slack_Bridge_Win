param(
    [Parameter(Mandatory=$true)][string]$DataDirectory,
    [Parameter(Mandatory=$true)][string]$UserSid
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($DataDirectory)
$user = [System.Security.Principal.SecurityIdentifier]::new($UserSid)
$system = [System.Security.Principal.SecurityIdentifier]::new('S-1-5-18')
function Protect-Entry([string]$entry) {
    $attributes = [IO.File]::GetAttributes($entry)
    if (($attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'DATA_REPARSE' }
    $directory = ($attributes -band [IO.FileAttributes]::Directory) -ne 0
    if ($directory) {
        $acl = [System.Security.AccessControl.DirectorySecurity]::new()
        $inheritance = [System.Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit'
    } else {
        $acl = [System.Security.AccessControl.FileSecurity]::new()
        $inheritance = [System.Security.AccessControl.InheritanceFlags]::None
    }
    $acl.SetAccessRuleProtection($true, $false)
    $acl.SetOwner($user)
    foreach ($sid in @($user, $system)) {
        $rule = [System.Security.AccessControl.FileSystemAccessRule]::new($sid, [System.Security.AccessControl.FileSystemRights]::FullControl, $inheritance, [System.Security.AccessControl.PropagationFlags]::None, [System.Security.AccessControl.AccessControlType]::Allow)
        $acl.AddAccessRule($rule)
    }
    if ($directory) { [IO.Directory]::SetAccessControl($entry, $acl) } else { [IO.File]::SetAccessControl($entry, $acl) }
    if ($directory) { $actual = [IO.Directory]::GetAccessControl($entry) } else { $actual = [IO.File]::GetAccessControl($entry) }
    if (-not $actual.AreAccessRulesProtected) { throw 'ACL_UNVERIFIED' }
    $rules = $actual.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier])
    if ($rules.Count -ne 2) { throw 'ACL_UNVERIFIED' }
    foreach ($rule in $rules) {
        if ($rule.IdentityReference.Value -notin @($UserSid, 'S-1-5-18') -or $rule.AccessControlType -ne 'Allow' -or $rule.FileSystemRights -ne 'FullControl') { throw 'ACL_UNVERIFIED' }
    }
    if ($directory) { foreach ($child in [IO.Directory]::EnumerateFileSystemEntries($entry)) { Protect-Entry $child } }
}
Protect-Entry $root
