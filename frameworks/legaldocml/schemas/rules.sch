<?xml version="1.0" encoding="UTF-8"?>
<sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2"
    xmlns:sqf="http://www.schematron-quickfix.com/validator/process"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <sch:ns uri="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/WD17" prefix="leg"/>
    <sch:ns uri="http://www.oxygenxml.com/sch/functions" prefix="osf"/>
    
    <sch:pattern>
        <sch:rule context="leg:bill//leg:article/leg:num">
            <!-- Get the current article number -->
            <sch:let name="billID" value="generate-id(ancestor::leg:bill[1])"/>
            <sch:let name="expectedNum" value="count(preceding::leg:article[generate-id(ancestor::leg:bill) eq $billID]/leg:num) + 1"/>
            <sch:let name="num" value="osf:getArticleNumber(.)"/>
            
            <sch:assert test="$num = $expectedNum" sqf:fix="correctNumber addNumber correctOrAddAll">
                The current article number must be 'Article <sch:value-of select="$expectedNum"/>'
            </sch:assert>
            
            <sch:assert test="matches(text(), '\s*Article\s*(\d+)\s*')">
                The format must be "Article N" where "N" is the actual article number.
            </sch:assert>
            
            <sqf:fix id="correctNumber" use-when="text()">
                <sqf:description>
                    <sqf:title>Set the article number to 'Article <sch:value-of select="$expectedNum"/>'</sqf:title>
                </sqf:description>
                <sqf:replace match="text()" select="concat('Article ',  $expectedNum)"/>
            </sqf:fix>
            <sqf:fix id="addNumber" use-when="not(text())">
                <sqf:description>
                    <sqf:title>Set the article number to 'Article <sch:value-of select="$expectedNum"/>'</sqf:title>
                </sqf:description>
                <sqf:add match="." select="concat('Article ',  $expectedNum)"/>
            </sqf:fix>
            <sqf:fix id="correctOrAddAll">
                <sqf:description>
                    <sqf:title>Correct all article numbers for the current bill.</sqf:title>
                </sqf:description>
                <sqf:replace match="(preceding::leg:article/leg:num, ., following::leg:article/leg:num)[generate-id(ancestor::leg:bill) eq $billID]/text()" 
                    select="concat('Article ', count(preceding::leg:article[generate-id(ancestor::leg:bill) eq $billID]/leg:num) + 1)"/>
                <sqf:add match="(preceding::leg:article/leg:num, ., following::leg:article/leg:num)[generate-id(ancestor::leg:bill) eq $billID][not(node())]" 
                    select="concat('Article ', count(preceding::leg:article[generate-id(ancestor::leg:bill) eq $billID]/leg:num) + 1)"/>
            </sqf:fix>
        </sch:rule>
    </sch:pattern>
    
    <xsl:function name="osf:getArticleNumber">
        <xsl:param name="numNode"/>
        <xsl:if test="$numNode and $numNode/text()">
            <xsl:analyze-string select="$numNode/text()" regex="\s*Article\s*(\d+)\s*">
                <xsl:matching-substring>
                    <xsl:value-of select="regex-group(1)"/>
                </xsl:matching-substring>
            </xsl:analyze-string>
        </xsl:if>
    </xsl:function>
</sch:schema>