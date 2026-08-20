using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("KZTEK Work Management")]
[assembly: AssemblyProduct("KZTEK Work Management Standalone Desktop Client")]
[assembly: AssemblyCompany("KZTEK Corporation")]
[assembly: AssemblyVersion("2.4.0.0")]
[assembly: AssemblyFileVersion("2.4.0.0")]

namespace Kztek.WorkManagement
{
    static class Program
    {
        private static Mutex appMutex;
        private const string MutexName = "Global\\KZTEK_Work_Management_App_Mutex_2026";

        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [DllImport("user32.dll")]
        private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [STAThread]
        static void Main()
        {
            bool createdNew;
            appMutex = new Mutex(true, MutexName, out createdNew);

            if (!createdNew)
            {
                IntPtr hWnd = FindWindow(null, "KZTEK Work — Nền tảng Điều hành & Quản lý Công việc");
                if (hWnd == IntPtr.Zero)
                {
                    hWnd = FindWindow(null, "KZTEK Work Management");
                }
                if (hWnd != IntPtr.Zero)
                {
                    ShowWindow(hWnd, 9); // SW_RESTORE
                    SetForegroundWindow(hWnd);
                }
                return;
            }

            string appDir = AppDomain.CurrentDomain.BaseDirectory;

            // 1. Kiem tra va khoi dong Server ngam neu chua chay
            EnsureServerRunning(appDir);

            // 2. Khoi chay Native Electron Desktop App
            LaunchElectronApp(appDir);
        }

        private static void EnsureServerRunning(string appDir)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:3000/manifest.json");
                req.Timeout = 1000;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    if (resp.StatusCode == HttpStatusCode.OK)
                    {
                        return; // Server da chay
                    }
                }
            }
            catch
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = "cmd.exe";
                    psi.Arguments = "/c node ./node_modules/next/dist/bin/next start -p 3000";
                    psi.WorkingDirectory = appDir;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;

                    Process.Start(psi);
                    Thread.Sleep(2500);
                }
                catch { }
            }
        }

        private static void LaunchElectronApp(string appDir)
        {
            string electronExe = Path.Combine(appDir, "node_modules", "electron", "dist", "electron.exe");
            string mainJs = Path.Combine(appDir, "desktop", "main.js");

            if (File.Exists(electronExe) && File.Exists(mainJs))
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = electronExe;
                psi.Arguments = "\"" + mainJs + "\"";
                psi.WorkingDirectory = appDir;
                psi.WindowStyle = ProcessWindowStyle.Normal;
                psi.UseShellExecute = false;

                Process p = Process.Start(psi);
                if (p != null)
                {
                    p.WaitForExit();
                }
            }
        }
    }
}
