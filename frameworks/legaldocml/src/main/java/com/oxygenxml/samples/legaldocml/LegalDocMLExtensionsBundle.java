package com.oxygenxml.samples.legaldocml;

import ro.sync.contentcompletion.xml.SchemaManagerFilter;
import ro.sync.ecss.extensions.api.AuthorAccess;
import ro.sync.ecss.extensions.api.AuthorAccessProvider;
import ro.sync.ecss.extensions.api.AuthorExtensionStateListener;
import ro.sync.ecss.extensions.api.ExtensionsBundle;

/**
 * Legal doc ML extensions bundle.
 * 
 * @author cristi_talau
 */
public class LegalDocMLExtensionsBundle extends ExtensionsBundle implements AuthorAccessProvider {

  /**
   * The current author access.
   */
  private AuthorAccess authorAccess = null;
  
  @Override
  public AuthorExtensionStateListener createAuthorExtensionStateListener() {
    return new AuthorExtensionStateListener() {
      
      public String getDescription() {
        return "Keeps track of the current AuthorAccess";
      }
      
      public void deactivated(AuthorAccess authorAccess) {
        LegalDocMLExtensionsBundle.this.authorAccess = null;
      }
      
      public void activated(AuthorAccess authorAccess) {
        LegalDocMLExtensionsBundle.this.authorAccess = authorAccess;
      }
    };
  }
  
  @Override
  public SchemaManagerFilter createSchemaManagerFilter() {
    return new LegalDocMLSchemaManagerFilter(this);
  }

  public String getDescription() {
    return "LegalDocML (Akoma Ntoso)";
  }

  @Override
  public String getDocumentTypeID() {
    return "legal-doc-ml";
  }

  @Override
  public AuthorAccess getAuthorAccess() {
    return authorAccess;
  }
}
