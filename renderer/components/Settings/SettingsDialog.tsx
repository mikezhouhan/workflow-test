import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Key, ExternalLink, QrCode } from "lucide-react";
import { useToast } from "../../contexts/toast";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApiKeySave?: (apiKey: string) => Promise<void>;
}

export function SettingsDialog({ open: externalOpen, onOpenChange, onApiKeySave }: SettingsDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(externalOpen || false);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Sync with external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Only call onOpenChange when there's actually a change
    if (onOpenChange && newOpen !== externalOpen) {
      onOpenChange(newOpen);
    }
  };
  
  // Load current config on dialog open
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      interface Config {
        apiKey?: string;
      }

      window.electronAPI
        .getConfig()
        .then((config: Config) => {
          setApiKey(config.apiKey || "");
        })
        .catch((error: unknown) => {
          console.error("Failed to load config:", error);
          showToast("Error", "Failed to load settings", "error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, showToast]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onApiKeySave && apiKey) {
        await onApiKeySave(apiKey);
        handleOpenChange(false);
        return;
      }

      const configData = {
        apiKey,
        apiProvider: "openai",
      };
      
      const result = await window.electronAPI.updateConfig(configData);
      
      if (result) {
        showToast("Success", "API Key saved successfully", "success");
        handleOpenChange(false);
        
        // Force reload the app to apply the API key
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error", "Failed to save API Key", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return "";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  // Open external link handler
  const openExternalLink = (url: string) => {
    window.electronAPI.openLink(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-[#0A0A0B] border-[0.5px] border-zinc-800 text-white settings-dialog rounded-xl"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(420px, 90vw)',
          height: 'auto',
          minHeight: '340px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 9999,
          margin: 0,
          padding: '28px',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          animation: 'fadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          opacity: 0.98,
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
      >        
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-zinc-800/70">
              <Key className="h-3.5 w-3.5 text-blue-400" />
            </span>
            <DialogDescription className="text-zinc-400 text-sm tracking-wide font-medium">
              {t('settings.api_key')}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="space-y-4">
          
            <div className="relative group">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-zinc-900/70 border-[0.5px] border-zinc-800/70 text-white pr-12 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 rounded-lg py-6 pl-4 transition-all duration-200 placeholder:text-zinc-600"
              />
              {apiKey && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-0.5 bg-zinc-800/90 rounded-md text-zinc-300 tracking-wide transition-all">
                  {maskApiKey(apiKey)}
                </div>
              )}
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-zinc-800/30 group-hover:ring-zinc-700/40 transition-all duration-300 pointer-events-none"></div>
            </div>
            
            <p className="text-[11px] text-zinc-500">
              {t('settings.api_key_storage_notice')}
            </p>
            
            <div className="mt-1 p-5 rounded-xl bg-zinc-900/50 border-[0.5px] border-zinc-800/70">
              <div className="flex items-center gap-2 mb-3">
                <QrCode size={14} className="text-blue-400/90" />
                <p className="text-[13px] font-medium text-zinc-300">扫描二维码加客服微信</p>
              </div>
              
              <div className="flex justify-center py-3">
                <div className="w-40 h-40 bg-white p-1 rounded-md">
                  <img
                    src="wechat_qrcode.png"
                    alt="WeChat QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row flex-nowrap justify-center gap-3 pt-6 border-t border-zinc-900">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="order-1 border-zinc-800 bg-transparent hover:bg-zinc-800/70 text-zinc-300 rounded-lg flex-1 max-w-[120px] h-11 transition-all duration-200"
          >
            {t('button.cancel')}
          </Button>
          
          <Button
            className={`order-2 flex-1 max-w-[120px] h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all duration-200 ${
              !apiKey ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSave}
            disabled={isLoading || !apiKey}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full"></div>
                <span className="text-zinc-300 text-sm">{t('settings.saving')}</span>
              </div>
            ) : (
              <span className="text-sm">{t('button.save')}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}