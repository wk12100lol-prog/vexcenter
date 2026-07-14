using System;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VexInstaller;

static class Program
{
    internal static string Repo = "wk12100lol-prog/vexcenter";
    internal static string AppName = "VexCenter";
    internal static string TempDir = Path.Combine(Path.GetTempPath(), "vexcenter-installer");
    internal static string? DownloadUrl;

    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new InstallerForm());
    }
}

class InstallerForm : Form
{
    private Label lblTitle, lblSub, lblVersion, lblStatus, lblPct;
    private ProgressBar progressBar;
    private Button btnAction, btnSecondary;

    public InstallerForm()
    {
        Text = "VexCenter Installer";
        Size = new Size(560, 400);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        BackColor = Color.FromArgb(26, 26, 46);
        Font = new Font("Segoe UI", 10);
        ShowWelcome();
    }

    void ClearControls()
    {
        Controls.Clear();
    }

    void ShowWelcome()
    {
        ClearControls();

        lblTitle = new Label { Text = "VexCenter", Font = new Font("Segoe UI", 28, FontStyle.Bold),
            ForeColor = Color.White, Size = new Size(500, 50), Location = new Point(30, 50), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblTitle);

        lblSub = new Label { Text = "Platforma dystrybucji gier cyfrowych", Font = new Font("Segoe UI", 11),
            ForeColor = Color.FromArgb(180, 180, 200), Size = new Size(500, 30), Location = new Point(30, 100), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblSub);

        lblVersion = new Label { Text = "Sprawdzanie wersji...", Font = new Font("Segoe UI", 9),
            ForeColor = Color.FromArgb(120, 120, 140), Size = new Size(500, 20), Location = new Point(30, 140), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblVersion);

        btnAction = new Button { Text = "Sprawdzanie...", Size = new Size(300, 44), Location = new Point(130, 190),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(124, 58, 237), ForeColor = Color.White,
            Font = new Font("Segoe UI", 12, FontStyle.Bold), Cursor = Cursors.Hand, Enabled = false };
        btnAction.FlatAppearance.BorderSize = 0;
        Controls.Add(btnAction);

        btnSecondary = new Button { Text = "Zamknij", Size = new Size(300, 36), Location = new Point(130, 245),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(40, 40, 60), ForeColor = Color.FromArgb(180, 180, 200),
            Font = new Font("Segoe UI", 10), Cursor = Cursors.Hand };
        btnSecondary.Click += (_, _) => Close();
        Controls.Add(btnSecondary);

        _ = CheckVersionAsync();
    }

    async Task CheckVersionAsync()
    {
        try
        {
            using var wc = new WebClient();
            wc.Headers.Add("User-Agent", "VexCenter-Installer");
            wc.Headers.Add("Accept", "application/vnd.github.v3+json");
            var json = await wc.DownloadStringTaskAsync($"https://api.github.com/repos/{Program.Repo}/releases/latest");
            var r = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);
            var tag = r.GetProperty("tag_name").GetString();
            var assets = r.GetProperty("assets");

            string? url = null;
            foreach (var a in assets.EnumerateArray())
            {
                var name = a.GetProperty("name").GetString();
                if (name != null && name.Contains("win-unpacked") && name.EndsWith(".zip"))
                {
                    url = a.GetProperty("browser_download_url").GetString();
                    break;
                }
            }

            if (url != null)
            {
                Program.DownloadUrl = url;
                lblVersion.Text = $"Najnowsza wersja: {tag}";
                btnAction.Text = $"Pobierz {Program.AppName} {tag}";
                btnAction.Enabled = true;
                btnAction.Click += (_, _) => ShowDownload();
            }
            else
            {
                lblVersion.Text = "Nie znaleziono pliku instalacyjnego";
                btnAction.Text = "Spróbuj ponownie";
                btnAction.Enabled = true;
                btnAction.Click += (_, _) => _ = CheckVersionAsync();
            }
        }
        catch (Exception ex)
        {
            lblVersion.Text = $"Błąd: {ex.Message}";
            btnAction.Text = "Spróbuj ponownie";
            btnAction.Enabled = true;
            btnAction.Click += (_, _) => _ = CheckVersionAsync();
        }
    }

    void ShowDownload()
    {
        Size = new Size(560, 350);
        ClearControls();

        lblTitle = new Label { Text = "Pobieranie VexCenter...", Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.White, Size = new Size(500, 40), Location = new Point(30, 40) };
        Controls.Add(lblTitle);

        progressBar = new ProgressBar { Size = new Size(500, 20), Location = new Point(30, 110), Style = ProgressBarStyle.Continuous };
        Controls.Add(progressBar);

        lblPct = new Label { Text = "0%", Font = new Font("Segoe UI", 12, FontStyle.Bold),
            ForeColor = Color.FromArgb(200, 200, 220), Size = new Size(500, 30), Location = new Point(30, 140), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblPct);

        lblStatus = new Label { Text = "Przygotowanie...", Font = new Font("Segoe UI", 9),
            ForeColor = Color.FromArgb(120, 120, 140), Size = new Size(500, 20), Location = new Point(30, 170), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblStatus);

        Refresh();
        _ = DownloadAsync();
    }

    async Task DownloadAsync()
    {
        try
        {
            Directory.CreateDirectory(Program.TempDir);
            var zipPath = Path.Combine(Program.TempDir, "VexCenter-win-unpacked.zip");

            using var wc = new WebClient();
            wc.Headers.Add("User-Agent", "VexCenter-Installer");
            wc.DownloadProgressChanged += (_, e) =>
            {
                progressBar.Value = e.ProgressPercentage;
                lblPct.Text = $"{e.ProgressPercentage}% ({e.BytesReceived / 1048576.0:F1}/{e.TotalBytesToReceive / 1048576.0:F1} MB)";
                Refresh();
            };
            await wc.DownloadFileTaskAsync(Program.DownloadUrl, zipPath);

            lblStatus.Text = "Pobrano! Wybierz folder docelowy...";
            Refresh();

            using var folderDialog = new FolderBrowserDialog();
            folderDialog.Description = "Wybierz folder docelowy dla VexCenter";
            folderDialog.SelectedPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "VexCenter");

            if (folderDialog.ShowDialog() != DialogResult.OK)
            {
                ShowError("Nie wybrano folderu.");
                return;
            }

            var targetDir = folderDialog.SelectedPath;
            Directory.CreateDirectory(targetDir);

            lblStatus.Text = $"Wypakowywanie do {targetDir} ...";
            Refresh();

            ZipFile.ExtractToDirectory(zipPath, targetDir, overwriteFiles: true);

            var exePath = Path.Combine(targetDir, "VexCenter.exe");
            if (File.Exists(exePath))
            {
                CreateShortcut(exePath);
            }

            ShowDone(exePath);
        }
        catch (Exception ex)
        {
            ShowError($"Błąd: {ex.Message}");
        }
    }

    static void CreateShortcut(string targetPath)
    {
        try
        {
            var desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            var shortcutPath = Path.Combine(desktop, "VexCenter.lnk");
            var shell = Type.GetTypeFromProgID("WScript.Shell");
            if (shell != null)
            {
                dynamic ws = Activator.CreateInstance(shell)!;
                dynamic sc = ws.CreateShortcut(shortcutPath);
                sc.TargetPath = targetPath;
                sc.Description = "VexCenter - Platforma dystrybucji gier";
                sc.Save();
            }
        }
        catch { /* shortcut is optional */ }
    }

    void ShowDone(string exePath)
    {
        ClearControls();

        var lblCheck = new Label { Text = "✓", Font = new Font("Segoe UI", 48),
            ForeColor = Color.FromArgb(16, 185, 129), Size = new Size(500, 60), Location = new Point(30, 40), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblCheck);

        lblTitle = new Label { Text = "Instalacja zakończona!", Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.White, Size = new Size(500, 40), Location = new Point(30, 110), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblTitle);

        lblSub = new Label { Text = "VexCenter zainstalowany. Skrót na pulpicie utworzony.",
            Font = new Font("Segoe UI", 10), ForeColor = Color.FromArgb(180, 180, 200),
            Size = new Size(500, 30), Location = new Point(30, 150), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblSub);

        btnAction = new Button { Text = "Uruchom VexCenter", Size = new Size(250, 44), Location = new Point(155, 210),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(16, 185, 129), ForeColor = Color.White,
            Font = new Font("Segoe UI", 12, FontStyle.Bold), Cursor = Cursors.Hand };
        btnAction.Click += (_, _) => { try { System.Diagnostics.Process.Start(exePath); } catch { } Close(); };
        Controls.Add(btnAction);

        btnSecondary = new Button { Text = "Zamknij", Size = new Size(250, 36), Location = new Point(155, 265),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(40, 40, 60), ForeColor = Color.FromArgb(180, 180, 200),
            Font = new Font("Segoe UI", 10), Cursor = Cursors.Hand };
        btnSecondary.Click += (_, _) => Close();
        Controls.Add(btnSecondary);
    }

    void ShowError(string msg)
    {
        ClearControls();

        var lblX = new Label { Text = "✕", Font = new Font("Segoe UI", 48),
            ForeColor = Color.FromArgb(239, 68, 68), Size = new Size(500, 60), Location = new Point(30, 40), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblX);

        lblTitle = new Label { Text = "Wystąpił błąd", Font = new Font("Segoe UI", 18, FontStyle.Bold),
            ForeColor = Color.White, Size = new Size(500, 40), Location = new Point(30, 110), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblTitle);

        lblStatus = new Label { Text = msg, Font = new Font("Segoe UI", 9),
            ForeColor = Color.FromArgb(239, 68, 68), Size = new Size(500, 40), Location = new Point(30, 150), TextAlign = ContentAlignment.MiddleCenter };
        Controls.Add(lblStatus);

        btnAction = new Button { Text = "Spróbuj ponownie", Size = new Size(250, 44), Location = new Point(155, 210),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(124, 58, 237), ForeColor = Color.White,
            Font = new Font("Segoe UI", 12, FontStyle.Bold), Cursor = Cursors.Hand };
        btnAction.Click += (_, _) => ShowWelcome();
        Controls.Add(btnAction);

        btnSecondary = new Button { Text = "Zamknij", Size = new Size(250, 36), Location = new Point(155, 265),
            FlatStyle = FlatStyle.Flat, BackColor = Color.FromArgb(40, 40, 60), ForeColor = Color.FromArgb(180, 180, 200),
            Font = new Font("Segoe UI", 10), Cursor = Cursors.Hand };
        btnSecondary.Click += (_, _) => Close();
        Controls.Add(btnSecondary);
    }
}
