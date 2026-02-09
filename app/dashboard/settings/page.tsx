import { GlassCard } from "@/components/ui/glass-card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NeonButton } from "@/components/ui/neon-button"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-2xl">
            <h1 className="text-3xl font-bold font-heading text-primary">Settings</h1>

            <GlassCard className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-bold mb-4">Appearance</h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Neon Mode</Label>
                            <p className="text-sm text-muted-foreground">Enable high-contrast neon glowing effects.</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-lg font-bold mb-4">Notifications</h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Price Alerts</Label>
                            <p className="text-sm text-muted-foreground">Get notified when watchlist stocks move &gt;5%.</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-lg font-bold mb-4">Data Source</h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Real-time Stream</Label>
                            <p className="text-sm text-muted-foreground">Use WebSocket connection for low-latency updates.</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                </div>

                <div className="pt-6">
                    <NeonButton className="w-full">Save Preferences</NeonButton>
                </div>
            </GlassCard>
        </div>
    )
}
