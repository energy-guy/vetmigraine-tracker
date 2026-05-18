# VetMigraine Tracker - Deployment Troubleshooting

The error you encountered during deployment is a **Google Cloud Platform (GCP) IAM permissions issue**, not an error in the application's code. 

## The Error
`PERMISSION_DENIED: IAM permission denied for service account 689046859022-compute@developer.gserviceaccount.com`

This means the default service account trying to build your app does not have permission to read the source code zip file from the Google Cloud Storage bucket.

## How to Fix It

You need to grant the required permissions to your default compute service account in the Google Cloud Console.

### Option 1: Grant Storage Object Viewer Role (Recommended)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **IAM & Admin** > **IAM**.
3. Check the box for "Include Google-provided role grants" on the right side if you don't see the account.
4. Find the service account mentioned in your error: `689046859022-compute@developer.gserviceaccount.com`.
5. Click the **Edit (pencil icon)** next to it.
6. Click **Add Another Role**.
7. Select **Cloud Storage** > **Storage Object Viewer** (or **Storage Admin**).
8. Click **Save**.
9. Try deploying your app again.

### Option 2: Grant Cloud Build Service Account Role
Sometimes the compute service account is used for builds and needs specific build permissions.
1. In the same IAM page, edit the `689046859022-compute@developer.gserviceaccount.com` account.
2. Add the role: **Cloud Build** > **Cloud Build Service Account**.
3. Save and redeploy.

*Note: The code for the VetMigraine Tracker is fully functional and ready to go once the GCP environment permissions are resolved.*
