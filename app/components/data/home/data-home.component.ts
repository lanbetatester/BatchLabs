import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { StorageService } from "app/services";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { FileGroupCreateFormComponent } from "../action";

import "./data-home.scss";

@Component({
    selector: "bl-data-home",
    templateUrl: "data-home.html",
})
export class DataHomeComponent implements OnDestroy {
    public quickSearchQuery = new FormControl();
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public hasAutoStorage = true;

    private _autoStorageSub: Subscription;

    constructor(
        private sidebarManager: SidebarManager,
        private storageService: StorageService) {

        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });

        this._autoStorageSub = this.storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            this.hasAutoStorage = hasAutoStorage;
        });
    }

    public ngOnDestroy() {
        this._autoStorageSub.unsubscribe();
    }

    @autobind()
    public addFileGroup() {
        this.sidebarManager.open("Add a new file group", FileGroupCreateFormComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = this.quickFilter;
    }
}
