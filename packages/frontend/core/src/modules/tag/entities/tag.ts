import type { Workspace } from '@toeverything/infra';
import { nanoid } from 'nanoid';

import type { WorkspaceLegacyProperties } from '../../workspace';

export class Tag {
  constructor(
    value: string,
    color: string,
    private readonly properties: WorkspaceLegacyProperties,
    private readonly workspace: Workspace
  ) {
    this.id = nanoid();
    this.value = value;
    this.color = color;
    this.createDate = Date.now();
    this.updateDate = 0;
  }
  readonly id: string;

  value: string;

  color: string;

  readonly createDate: number | undefined;

  updateDate: number | undefined;

  private get pageMetas() {
    return this.workspace.blockSuiteWorkspace.meta.docMetas;
  }
  private getPageMetaByPageId(pageId: string) {
    return this.pageMetas.find(meta => meta.id === pageId);
  }

  rename(value: string) {
    this.value = value;
    this.updateDate = Date.now();
  }

  changeColor(color: string) {
    this.color = color;
    this.updateDate = Date.now();
  }

  tag(pageId: string) {
    const pageMeta = this.getPageMetaByPageId(pageId);
    if (!pageMeta) {
      return;
    }
    if (pageMeta.tags.includes(this.id)) {
      return;
    }
    this.properties.updatePageTags(pageId, [...pageMeta.tags, this.id]);
  }

  untag(pageId: string) {
    const pageMeta = this.getPageMetaByPageId(pageId);
    if (!pageMeta) {
      return;
    }
    if (!pageMeta.tags.includes(this.id)) {
      return;
    }
    this.properties.updatePageTags(
      pageId,
      pageMeta.tags.filter(tagId => tagId !== this.id)
    );
  }
}
