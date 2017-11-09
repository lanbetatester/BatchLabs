import { Type } from "@angular/core";
import { BatchServiceClient } from "azure-batch";

import { ServerError } from "app/models";
import { BatchClientService } from "app/services";
import { ListGetter, ListGetterConfig, ListGetterOptions } from "app/services/core/data/list-getter";
import { Observable } from "rxjs";

export interface BatchListConfig<TEntity, TParams> extends ListGetterConfig<TEntity, TParams> {
    list: (client: BatchServiceClient, params: TParams, options: any) => Promise<any[]>;
    listNext: (client: BatchServiceClient, nextLink: string) => Promise<any[]>;
}

export class BatchListGetter<TEntity, TParams> extends ListGetter<TEntity, TParams> {
    private _list: (client: BatchServiceClient, params: TParams, options: ListGetterOptions) => Promise<any[]>;
    private _listNext: (client: BatchServiceClient, nextLink: string) => Promise<any[]>;

    constructor(
        type: Type<TEntity>,
        private batchClient: BatchClientService,
        config: BatchListConfig<TEntity, TParams>) {

        super(type, config);
        this._list = config.list;
        this._listNext = config.listNext;
    }

    protected list(params: TParams, options: any): Observable<any> {
        return this.batchClient.get().flatMap((proxy) => {
            return Observable.fromPromise(this._list(proxy.client, params, options));
        }).map(x => this._processBatchResponse(x)).catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        }).share();
    }

    protected listNext(nextLink: string): Observable<any> {
        return this.batchClient.get().flatMap((proxy) => {
            return Observable.fromPromise(this._listNext(proxy.client, nextLink));
        }).map(x => this._processBatchResponse(x)).catch((error) => {
            return Observable.throw(ServerError.fromBatch(error));
        }).share();
    }

    private _processBatchResponse(data) {
        console.log("Data", data, data.odatanextLink);
        return {
            data,
            nextLink: data.odatanextLink,
        };
    }
}
