package com.oxygenxml.samples.legaldocml;

import static java.util.stream.Collectors.toList;

import java.util.Arrays;
import java.util.List;

import ro.sync.contentcompletion.xml.CIAttribute;
import ro.sync.contentcompletion.xml.CIElement;
import ro.sync.contentcompletion.xml.CIValue;
import ro.sync.contentcompletion.xml.Context;
import ro.sync.contentcompletion.xml.SchemaManagerFilter;
import ro.sync.contentcompletion.xml.WhatAttributesCanGoHereContext;
import ro.sync.contentcompletion.xml.WhatElementsCanGoHereContext;
import ro.sync.contentcompletion.xml.WhatPossibleValuesHasAttributeContext;
import ro.sync.ecss.extensions.api.AuthorAccess;
import ro.sync.ecss.extensions.api.AuthorAccessProvider;
import ro.sync.ecss.extensions.api.node.AuthorNode;

/**
 * Schema Manager filter.
 * 
 * @author cristi_talau
 */
public class LegalDocMLSchemaManagerFilter implements SchemaManagerFilter {
  
  /**
   * Access provider.
   */
  private final AuthorAccessProvider accessProvider;

  public LegalDocMLSchemaManagerFilter(AuthorAccessProvider accessProvider) {
    this.accessProvider = accessProvider;
  }
  
  /**
   * Do not propose these elements to surround a paragraph.
   */
  private final List<String> invalidParagraphParents = Arrays.asList("p", "table");

  public List<CIElement> filterElements(List<CIElement> elements, WhatElementsCanGoHereContext context) {
    List<CIElement> toReturn = elements;
    AuthorAccess authorAccess = this.accessProvider.getAuthorAccess();
    if (authorAccess != null) {
      AuthorNode fullySelectedNode = authorAccess.getEditorAccess().getFullySelectedNode();
      if (fullySelectedNode != null && fullySelectedNode.getName().equals("p")) {
        toReturn = elements.stream()
            .filter(elem -> !invalidParagraphParents.contains(elem.getName()))
            .collect(toList());
      }
    }
    return toReturn;
  }

  public String getDescription() {
    return "Used to filter content completion items";
  }

  public List<CIValue> filterAttributeValues(List<CIValue> values, WhatPossibleValuesHasAttributeContext context) {
    return values;
  }

  public List<CIAttribute> filterAttributes(List<CIAttribute> attributes, WhatAttributesCanGoHereContext context) {
    return attributes;
  }

  public List<CIValue> filterElementValues(List<CIValue> values, Context context) {
    return values;
  }

}
