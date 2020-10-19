# Copyright (c) 2020     Red Hat, Inc.
# This program and the accompanying materials are made
# available under the terms of the Eclipse Public License 2.0
# which is available at https://www.eclipse.org/legal/epl-2.0/
#
# SPDX-License-Identifier: EPL-2.0
#
# Contributors:
#   Red Hat, Inc. - initial API and implementation

ARG CHE_DASHBOARD_IMAGE=quay.io/eclipse/che-dashboard
ARG CHE_DASHBOARD_VERSION=next

FROM docker.io/node:10.20.1 as builder

COPY package.json /dashboard-next/
COPY yarn.lock /dashboard-next/
WORKDIR /dashboard-next
RUN yarn --network-timeout 600000 && yarn install --ignore-optional
COPY . /dashboard-next/
RUN yarn compile

FROM ${CHE_DASHBOARD_IMAGE}:${CHE_DASHBOARD_VERSION}
# TODO Rework Che Server to copy the right folder https://github.com/eclipse/che/blob/master/dockerfiles/che/Dockerfile#L31
COPY --from=builder /dashboard-next/build /usr/local/apache2/htdocs/dashboard/next
# TODO Make sure we should remove it
#RUN sed -i -r -e 's#<base href="/">#<base href="/dashboard/next/"#g'  /usr/local/apache2/htdocs/dashboard/next/index.html
