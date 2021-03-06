import { Component, OnDestroy, OnInit } from "@angular/core";
import { autobind } from "core-decorators";
import { List } from "immutable";
import * as moment from "moment";
import { Subscription } from "rxjs";

import { FormControl } from "@angular/forms";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import "./all-job-graphs-home.scss";

enum TimeRange {
    hour = 1,
    day = 2,
    week = 3,
}
@Component({
    selector: "bl-all-job-graphs-home",
    templateUrl: "all-job-graphs-home.html",
})
export class AllJobGraphsComponent implements OnInit, OnDestroy {
    public TimeRange = TimeRange;
    public jobs: List<Job>;
    public loading = false;

    public selectedTimeRange = new FormControl(TimeRange.day);

    private _sub: Subscription;
    constructor(private jobService: JobService) {
        this._sub = this.selectedTimeRange.valueChanges.subscribe(() => {
            this.loading = true;
            this._loadJobs();
        });
    }

    public ngOnInit() {
        this.loading = true;
        this._loadJobs();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    @autobind()
    public refresh() {
        return this._loadJobs();
    }

    private _loadJobs() {

        const obs = this.jobService.listAll({
            select: "id,executionInfo,stats",
            filter: this._buildFilter().toOData(),
            pageSize: 1000,
        });
        obs.subscribe((jobs) => {
            this.loading = false;
            this.jobs = List(jobs.filter(x => Boolean(x.stats && x.executionInfo)));
        });
        return obs;
    }

    private _buildFilter() {
        const completedFilter = FilterBuilder.prop("state").eq(JobState.completed);
        const rangeFilter = this._getRangeFilter();
        return FilterBuilder.and(completedFilter, rangeFilter);
    }

    private _getRangeFilter() {
        let date: moment.Moment;
        const now = moment();
        switch (this.selectedTimeRange.value) {
            case TimeRange.hour:
                date = now.subtract(1, "hour");
                break;
            case TimeRange.day:
                date = now.subtract(1, "day");
                break;
            case TimeRange.week:
                date = now.subtract(1, "week");
                break;
            default:
                date = now.subtract(1, "day");
                break;
        }
        return FilterBuilder.prop("executionInfo/endTime").ge(date.toDate());
    }
}
