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

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { GetApplicationAttemptAction } from '../../store/actions/application';
import { ApplicationEditorState } from 'ama-sdk';
import { ShowProcessesAction } from '../../store/actions/processes';
import { ShowConnectorsAction } from '../../../connector-editor/store/connector-editor.actions';

@Injectable()
export class ApplicationLoaderGuard implements CanActivate {
    constructor(private store: Store<ApplicationEditorState>) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const applicationId = route.params.applicationId;
        this.store.dispatch(new GetApplicationAttemptAction(applicationId));
        this.store.dispatch(new ShowProcessesAction(applicationId));
        this.store.dispatch(new ShowConnectorsAction(applicationId));
        return of(true);
    }
}