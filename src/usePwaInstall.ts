import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePwaInstall = () => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isReadyToInstall, setIsReadyToInstall] = useState(true); // Always true for testing/visibility
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (installed)
        const checkStandalone = () => {
            const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
            // @ts-ignore - iOS specific check fallback
            const isStandaloneIOS = window.navigator.standalone === true;

            setIsStandalone(isStandaloneMedia || isStandaloneIOS);
        };

        checkStandalone();

        // Check if it's an iOS device
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // If it's iOS and not standalone, we can consider it "ready to show iOS instructions"
        if (isIosDevice && !isStandalone) {
            setIsReadyToInstall(true);
        }

        // Android/Chrome event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e as BeforeInstallPromptEvent);
            // We already forced true above, but keep this for standard behavior 
            setIsReadyToInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsReadyToInstall(false);
            setInstallPrompt(null);
            setIsStandalone(true);
            console.log('PWA was installed');
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [isStandalone]);

    const handleInstallClick = async () => {
        if (isIOS) {
            // Return true to indicate we should show the iOS manual instructions modal
            return true;
        }

        if (!installPrompt) {
            // Se o prompt real ainda não estiver disponível (ex: localhost sem HTTPS),
            // podemos avisar o usuário que precisa ser em um ambiente de produção ou usar o Chrome
            alert("Para instalar The App, adicione-o à tela inicial pelo menu do seu navegador (Instalar Aplicativo).");
            return false;
        }

        // Show the install prompt
        await installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsReadyToInstall(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, clear it up
        setInstallPrompt(null);
        return false;
    };

    return {
        isReadyToInstall,
        isIOS,
        isStandalone,
        handleInstallClick
    };
};
