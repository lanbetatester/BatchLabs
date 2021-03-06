import { Injectable, Injector, NgZone } from "@angular/core";
import * as MouseTrap from "mousetrap";

import * as CommandMap from "app/commands";
import { CommandBase } from "app/commands/core";
import { KeyBindings } from "app/models";
import { ObjectUtils } from "app/utils";
import { SettingsService } from "./settings.service";

export const commands: any[] = ObjectUtils.values(CommandMap as any).filter((x: any) => x.id !== undefined);

@Injectable()
export class CommandService {
    private _commandMap: { [key: string]: CommandBase } = {};
    private _setOnce = false;

    constructor(private injector: Injector, private zone: NgZone, private settingsService: SettingsService) {

    }

    public init() {
        for (let key of Object.keys(CommandMap)) {
            const command = CommandMap[key];
            if (command.id) {
                this._commandMap[command.id] = this.injector.get(command);
            }
        }

        this.settingsService.keybindings.subscribe((keybindings) => {
            if (keybindings) {
                this.registerShortcuts(keybindings);
            }
        });
    }

    public perform(action: string) {
        const command = this._commandMap[action];
        if (!command) {
            return;
        }

        command.execute();
    }

    public registerShortcuts(keybindings: KeyBindings[]) {
        if (this._setOnce) {
            MouseTrap.reset();
        }
        this._setOnce = true;
        for (let shortcut of keybindings) {
            MouseTrap.bind(shortcut.key, () => {
                this.zone.run(() => {
                    this.perform(shortcut.command);
                });
            });
        }
    }
}
