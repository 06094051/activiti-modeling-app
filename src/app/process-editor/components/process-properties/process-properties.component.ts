 /*!
 * @license
 * Copyright 2018 Alfresco, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { CardViewItem, CardViewUpdateService, UpdateNotification, CardItemTypeService } from '@alfresco/adf-core';
import { Store } from '@ngrx/store';
import { ProcessEditorState } from '../../store/process-editor.state';
import { selectSelectedElement } from '../../store/process-editor.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { ProcessModelerService } from '../../services/process-modeler.service';
import { CardViewPropertiesFactory } from '../../services/cardview-properties/cardview-properties.factory';
import { PROCESS_EDITOR_CUSTOM_PROPERTY_HANDLERS, ProcessEditorCustomProperty } from 'ama-sdk';

@Component({
    selector: 'ama-process-properties',
    templateUrl: './process-properties.component.html',
    styleUrls: ['./process-properties.component.scss'],
    providers: [CardViewUpdateService, CardItemTypeService]
})
export class ProcessPropertiesComponent implements OnInit, OnDestroy, AfterViewInit {
    /** @deprecated: bpmnjs-properties */
    @ViewChild('bpmnPropertiesPanel') bpmnPropertiesPanel: ElementRef;
    onDestroy$: Subject<void> = new Subject<void>();
    properties$: Observable<CardViewItem[]>;

    constructor(
        private store: Store<ProcessEditorState>,
        private processModelerService: ProcessModelerService,
        private cardViewFactory: CardViewPropertiesFactory,
        private cardViewUpdateService: CardViewUpdateService,
        private cardItemTypeService: CardItemTypeService,
       @Inject(PROCESS_EDITOR_CUSTOM_PROPERTY_HANDLERS) private customPropertyHandlers: ProcessEditorCustomProperty[]
    ) {}

    ngOnInit() {
        this.properties$ = this.store.select(selectSelectedElement).pipe(map(this.getPropertiesForShape.bind(this)));

        this.cardViewUpdateService.itemUpdated$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(this.updateElementProperty.bind(this));

        for (const handler of this.customPropertyHandlers) {
            this.cardItemTypeService.setComponentTypeResolver(handler.type, () => handler.implmentationClass, true);
        }
    }

    /** @deprecated: bpmnjs-properties */
    ngAfterViewInit() {
        try {
            const propertiesPanel = (<any>this.processModelerService).modeler.get('propertiesPanel');
            propertiesPanel.attachTo(this.bpmnPropertiesPanel.nativeElement);
        } catch {
            /*tslint:disable-next-line*/
            console.warn('Bpmnjs properties panel are not included. If not needed, remove all code marked with "@deprecated: bpmnjs-properties".');
        }
    }

    private getPropertiesForShape(shape) {
        if (shape === null) {
            return [];
        }

        const element = this.processModelerService.getElement(shape.id);
        return this.cardViewFactory.createCardViewPropertiesFor(element);
    }

    private updateElementProperty(updateObject: UpdateNotification) {
        const shapeId = updateObject.target.data.id,
            propertyName = updateObject.target.key,
            value = updateObject.changed[propertyName];

        this.processModelerService.updateElementProperty(shapeId, propertyName, value);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}