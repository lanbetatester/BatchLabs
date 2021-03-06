import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { BreadcrumbService } from "app/components/base/breadcrumbs";
import { ContextMenuService } from "app/components/base/context-menu";
import {
    TableCellComponent, TableColumnComponent, TableComponent, TableHeadComponent, TableRowComponent,
} from "app/components/base/table";
import { VmSize } from "app/models";
import { click } from "test/utils/helpers";

const sizeA = new VmSize({ name: "Size A", numberOfCores: 1, resourceDiskSizeInMB: 1000 } as any);
const sizeB = new VmSize({ name: "Size B", numberOfCores: 8, resourceDiskSizeInMB: 2000 } as any);
const sizeC = new VmSize({ name: "Size C", numberOfCores: 4, resourceDiskSizeInMB: 80000 } as any);
const sizeD = new VmSize({ name: "Size D", numberOfCores: 2, resourceDiskSizeInMB: 4000 } as any);

@Component({
    template: `
        <bl-table [(activeItem)]="pickedSize">
            <bl-thead>
                <bl-column >Name</bl-column>
                <bl-column [sortable]="true">Cores</bl-column>
                <bl-column [sortable]="true">RAM</bl-column>
            </bl-thead>
            <bl-row *ngFor="let size of sizes" [key]="size.name">
                <bl-cell [value]="size.name"></bl-cell>
                <bl-cell [value]="size.numberOfCores"></bl-cell>
                <bl-cell [value]="size.resourceDiskSizeInMB">{{size.resourceDiskSizeInMB}}MB</bl-cell>
            </bl-row>
        </bl-table>
    `,
})
class TestComponent {
    public sizes: VmSize[] = [];
    public picedSize: string;
}

describe("TableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TableComponent;
    let de: DebugElement;

    function getRows(): HTMLElement[] {
        // Cannot use de.queryAll angular bug: https://github.com/angular/angular/issues/13066
        return de.nativeElement.querySelectorAll("tbody tr");
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                TableComponent, TableRowComponent, TableHeadComponent,
                TableCellComponent, TableColumnComponent, TestComponent,
            ],
            providers: [
                { provide: ContextMenuService, useValue: null },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-table"));
        component = de.componentInstance;
        testComponent.sizes = [sizeA, sizeB, sizeC, sizeD];
        fixture.detectChanges();

    });

    describe("Sort", () => {
        let columns: DebugElement[];

        beforeEach(() => {
            columns = de.queryAll(By.css("bl-column"));
        });

        it("should not sort by any column by default", () => {
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size D");
        });

        it("should not sort when clicking on non sortable column", () => {
            click(columns[0]); // Click on the name column
            fixture.detectChanges();

            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size D");
        });

        it("should sort by number of cores", () => {
            click(columns[1]); // Click on the core size column
            fixture.detectChanges();

            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size D");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size B");
        });

        it("should sort by disk size", () => {
            click(columns[2]); // Click on the disk size column
            fixture.detectChanges();
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size D");
            expect(rows[3].textContent).toContain("Size C");
        });

        it("clicking twice on column should filter desc", () => {
            click(columns[1]); // Click on the core size column
            fixture.detectChanges();
            click(columns[1]); // Click again
            fixture.detectChanges();
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size B");
            expect(rows[1].textContent).toContain("Size C");
            expect(rows[2].textContent).toContain("Size D");
            expect(rows[3].textContent).toContain("Size A");
        });
    });
});
