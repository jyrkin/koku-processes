<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        version="2.0" xmlns:fe="http://www.arcusys.fi/DynamicFields"
        xmlns:arc="http://www.arcusys.fi/OUKA/xslt"
        exclude-result-prefixes="fe arc">
        <xsl:output method="xml" indent="yes" />
        <xsl:template match="fe:Dynamic_Fields_Form">
		<xsl:element name="choices">
			<xsl:for-each select="//fe:MultipleChoice">
				<xsl:element name="choice">
		                        <xsl:element name="description">
		                                 <xsl:value-of select="fe:MultipleChoice_Question" />
		                        </xsl:element>
		                        <xsl:element name="number">
		                                 <xsl:value-of select="fe:MultipleChoice_Number" />
		                        </xsl:element>
		                        <xsl:element name="questionNumber">
		                                 <xsl:value-of select="fe:MultipleChoice_Section" />
		                        </xsl:element>
				</xsl:element>
			</xsl:for-each>
		</xsl:element>
        </xsl:template>
</xsl:stylesheet>