/**
 * HackRore Report Engine v1.0
 * Aggregates session telemetry, hardware history, and job data 
 * into a structured manifest for the "Golden Ticket" certificate.
 */

export const generateReportManifest = () => {
    try {
        const history = JSON.parse(localStorage.getItem('hr_history') || '[]');
        const jobs = JSON.parse(localStorage.getItem('hr_jobs') || '[]');
        const telemetry = {
            battery: localStorage.getItem('hr_telemetry_battery'),
            network: localStorage.getItem('hr_telemetry_network'),
            fps: localStorage.getItem('hr_telemetry_fps'),
            os: navigator.platform,
            cpu_cores: navigator.hardwareConcurrency,
            user_agent: navigator.userAgent
        };

        return {
            timestamp: new Date().toISOString(),
            reportID: `HR-${Math.floor(100000 + Math.random() * 900000)}`,
            telemetry,
            history: history.slice(-20), // Last 20 actions
            active_jobs: jobs.filter(j => j.status !== 'Delivered'),
            metadata: {
                version: '2.1.0-DAILY',
                engine: 'HackRore_Pulse_v1'
            }
        };
    } catch (e) {
        console.error('REPORT_ENGINE_CRITICAL_FAILURE', e);
        return null;
    }
};
