import type { Workspace } from '@toeverything/infra';

import type { WorkspaceLegacyProperties } from '../workspace';
import { Tag } from './entities/tag';

export class TagService {
  constructor(
    private readonly properties: WorkspaceLegacyProperties,
    private readonly workspace: Workspace
  ) {}

  readonly tags = this.properties.tagOptions$;

  private get pageMetas() {
    return this.workspace.blockSuiteWorkspace.meta.docMetas;
  }

  createTag(value: string, color: string) {
    const newTag = new Tag(value, color, this.properties, this.workspace);
    this.properties.updateTagOptions([...this.tags.value, newTag]);
  }

  deleteTag(tagId: string) {
    this.properties.removeTagOption(tagId);
  }

  getTagsByPageId(pageId: string) {
    const pageMeta = this.pageMetas.find(meta => meta.id === pageId);
    if (!pageMeta) {
      return [];
    }
    return this.tags.value.filter(tag => pageMeta.tags.includes(tag.id));
  }
}
