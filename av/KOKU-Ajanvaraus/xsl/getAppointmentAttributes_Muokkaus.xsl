<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="2.0" xmlns:fe="http://www.arcusys.fi/KOKU/Ajanvaraus">
	<xsl:output method="xml" indent="yes" />

	<xsl:template match="@* | node()">
		<xsl:copy>
			<xsl:apply-templates select="@* | node()" />
		</xsl:copy>
	</xsl:template>

	<xsl:template name="output-tokens">
		<xsl:param name="list" />
		<!--
			<xsl:variable name="newlist" select="concat(normalize-space($list),
			',')" />
		-->
		<xsl:variable name="first" select="substring-before($list, ',')" />
		<xsl:variable name="remaining" select="substring-after($list, ',')" />
		<xsl:element name="receipients">
			<xsl:value-of select="$first" />
		</xsl:element>
		<xsl:if test="$remaining">
			<xsl:call-template name="output-tokens">
				<xsl:with-param name="list" select="$remaining" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template match="fe:Ajanvaraus_Form">
		<xsl:copy>
			<xsl:element name="appointment">
				<xsl:element name="appointmentId">
					<xsl:value-of select="//fe:Lomake_ID/text()" />
				</xsl:element>
				<xsl:element name="sender">
					<xsl:value-of select="//fe:User_Sender/text()" />
				</xsl:element>

				<xsl:element name="senderRole">
					<xsl:value-of select="//fe:User_Role/text()" />
				</xsl:element>

				<xsl:for-each select="//fe:Recipients">
					<xsl:element name="receipients">
						<xsl:call-template name="output-tokens">
							<xsl:with-param name="list">
								<xsl:value-of select="concat(fe:Recipients_Recipient/text(), ',')" />
							</xsl:with-param>
						</xsl:call-template>
						<xsl:element name="targetPerson">
							<xsl:value-of select="fe:Recipients_TargetPerson/text()" />
						</xsl:element>
					</xsl:element>
				</xsl:for-each>

				<xsl:element name="subject">
					<xsl:value-of select="//fe:Header_Text/text()" />
				</xsl:element>

				<xsl:element name="description">
					<xsl:value-of select="//fe:Header_Description/text()" />
				</xsl:element>

				<xsl:for-each select="//fe:slots">
					<xsl:element name="slots">
						<xsl:element name="slotNumber">
							<xsl:value-of select="fe:slotNumber/text()" />
						</xsl:element>
						<xsl:element name="appointmentDate">
							<xsl:value-of select="fe:appointmentDate/text()" />
						</xsl:element>
						<xsl:element name="startTime">
							<xsl:value-of select="fe:startTime/text()" />
						</xsl:element>
						<xsl:element name="endTime">
							<xsl:value-of select="fe:endTime/text()" />
						</xsl:element>
						<xsl:element name="location">
							<xsl:value-of select="fe:location/text()" />
						</xsl:element>
						<xsl:element name="comment">
							<xsl:value-of select="fe:comment/text()" />
						</xsl:element>
					</xsl:element>
				</xsl:for-each>
			</xsl:element>
		</xsl:copy>
	</xsl:template>
</xsl:stylesheet>
