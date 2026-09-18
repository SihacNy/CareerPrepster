"use client";

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebar: {
    width: "35%",
    padding: 22,
    color: "#FFFFFF",
  },
  main: {
    width: "65%",
    padding: 24,
    color: "#0F172A",
  },
  avatarContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarInitials: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  sidebarSection: {
    marginBottom: 14,
  },
  sidebarTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "rgba(255, 255, 255, 0.35)",
    paddingBottom: 2.5,
    marginBottom: 6,
    color: "#FFFFFF",
  },
  contactField: {
    marginBottom: 5,
  },
  contactLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  contactValue: {
    fontSize: 7.5,
    color: "#E2E8F0",
    marginTop: 1,
  },
  eduItem: {
    marginBottom: 6,
  },
  eduDate: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#CBD5E1",
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#FFFFFF",
    marginTop: 1,
  },
  eduInstitution: {
    fontSize: 7.5,
    color: "#E2E8F0",
    marginTop: 0.5,
  },
  eduGpa: {
    fontSize: 7,
    fontStyle: "italic",
    color: "#94A3B8",
    marginTop: 0.5,
  },
  skillCategoryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#CBD5E1",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  skillBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  skillBulletDot: {
    width: 7,
    fontSize: 7,
    color: "#FFFFFF",
  },
  skillBulletText: {
    flex: 1,
    fontSize: 7.5,
    color: "#F1F5F9",
  },
  candidateName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    textTransform: "uppercase",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  candidateRole: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#475569",
    marginTop: 2,
  },
  summaryText: {
    fontSize: 7.8,
    lineHeight: 1.35,
    color: "#475569",
    marginTop: 6,
    textAlign: "justify",
  },
  mainSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#1E293B",
    borderBottomWidth: 1.2,
    borderBottomColor: "#334155",
    paddingBottom: 2,
    marginTop: 10,
    marginBottom: 8,
  },
  timelineContainer: {
    position: "relative",
    paddingLeft: 12,
    borderLeftWidth: 1.2,
    borderLeftColor: "#CBD5E1",
    marginLeft: 3,
  },
  timelineEntry: {
    position: "relative",
    marginBottom: 8,
  },
  timelineNode: {
    position: "absolute",
    left: -16.2,
    top: 2,
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    borderWidth: 1.2,
    backgroundColor: "#FFFFFF",
  },
  entryDate: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#1E293B",
  },
  entryCompany: {
    fontSize: 7.5,
    color: "#475569",
    marginTop: 0.5,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#0F172A",
    marginTop: 1,
  },
  entryBulletRow: {
    flexDirection: "row",
    marginTop: 1.5,
    alignItems: "flex-start",
  },
  entryBulletDot: {
    width: 7,
    fontSize: 7,
    color: "#64748B",
  },
  entryBulletText: {
    flex: 1,
    fontSize: 7.5,
    color: "#475569",
    lineHeight: 1.3,
  },
});

export function ModernPhotoPdfDocument({ data }: { data: CVData }) {
  const { personalInfo } = data;
  const accentColor = data.accentColor || "#263244";
  const photoUrl = personalInfo.photoUrl;
  const education = getSectionItems(data, "EDUCATION");
  const experience = getSectionItems(data, "EXPERIENCE");
  const projects = getSectionItems(data, "PROJECTS");
  const customSections = (data.sections || []).filter(
    (s) => s.sectionType === "CUSTOM" && s.isVisible !== false && s.items && s.items.length > 0
  );
  const skillGroups =
    data.skillGroups && data.skillGroups.length > 0
      ? data.skillGroups
      : data.skills || [];

  const initials = personalInfo.fullName
    ? personalInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CV";

  return (
    <Document title={`${personalInfo.fullName || "Resume"} - Photo CV`}>
      <Page size="A4" style={styles.page}>
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR (Dark Accent: Photo, Contact, Education, Expertise)          */}
        {/* ========================================================================= */}
        <View style={[styles.sidebar, { backgroundColor: accentColor }]}>
          {/* Avatar Photo */}
          <View style={styles.avatarContainer}>
            {photoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={photoUrl} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Section: Contact */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            {personalInfo.phone ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{personalInfo.phone}</Text>
              </View>
            ) : null}
            {personalInfo.email ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{personalInfo.email}</Text>
              </View>
            ) : null}
            {personalInfo.location ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{personalInfo.location}</Text>
              </View>
            ) : null}
            {personalInfo.linkedinUrl ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>LinkedIn</Text>
                <Text style={styles.contactValue}>
                  {personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </Text>
              </View>
            ) : null}
            {personalInfo.portfolioUrl ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>Portfolio</Text>
                <Text style={styles.contactValue}>
                  {personalInfo.portfolioUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Section: Education */}
          {education && education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              {education.map((edu) => {
                const dateStr = [edu.startDate, edu.isCurrent ? "Present" : edu.endDate]
                  .filter(Boolean)
                  .join(" – ");
                return (
                  <View key={edu.id} style={styles.eduItem}>
                    {dateStr ? <Text style={styles.eduDate}>{dateStr}</Text> : null}
                    <Text style={styles.eduDegree}>{edu.title || (edu as any).degree}</Text>
                    <Text style={styles.eduInstitution}>
                      {edu.subtitle || (edu as any).institution}
                      {edu.location ? `, ${edu.location}` : ""}
                    </Text>
                    {edu.gpa ? <Text style={styles.eduGpa}>GPA: {edu.gpa}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* Section: Expertise */}
          {skillGroups && skillGroups.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Expertise</Text>
              {skillGroups.map((group) => (
                <View key={group.id} style={{ marginBottom: 4 }}>
                  {group.categoryName ? (
                    <Text style={styles.skillCategoryTitle}>{group.categoryName}</Text>
                  ) : null}
                  {group.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillBulletRow}>
                      <Text style={styles.skillBulletDot}>•</Text>
                      <Text style={styles.skillBulletText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* RIGHT MAIN CONTENT (Name, Role, Summary, Timeline Experience & Projects) */}
        {/* ========================================================================= */}
        <View style={styles.main}>
          {/* Header */}
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.candidateName}>
              {personalInfo.fullName || "Mariana Anderson"}
            </Text>
            {data.targetRole ? (
              <Text style={styles.candidateRole}>{data.targetRole}</Text>
            ) : null}
            {personalInfo.summary ? (
              <Text style={styles.summaryText}>{personalInfo.summary}</Text>
            ) : null}
          </View>

          {/* Experience Section */}
          {experience && experience.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>Experience</Text>
              <View style={styles.timelineContainer}>
                {experience.map((exp) => {
                  const bullets = getBulletTexts(exp.bulletPoints);
                  const dateStr = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate]
                    .filter(Boolean)
                    .join(" – ");
                  const companyAndLocation = [exp.subtitle || (exp as any).company, exp.location]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <View key={exp.id} style={styles.timelineEntry}>
                      <View style={[styles.timelineNode, { borderColor: accentColor }]} />
                      {dateStr ? <Text style={styles.entryDate}>{dateStr}</Text> : null}
                      {companyAndLocation ? (
                        <Text style={styles.entryCompany}>{companyAndLocation}</Text>
                      ) : null}
                      <Text style={styles.entryTitle}>{exp.title || (exp as any).role}</Text>
                      {bullets.length > 0 && (
                        <View style={{ marginTop: 2 }}>
                          {bullets.map((bp, i) => (
                            <View key={i} style={styles.entryBulletRow}>
                              <Text style={styles.entryBulletDot}>•</Text>
                              <Text style={styles.entryBulletText}>{stripMarkdown(bp)}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>Featured Projects</Text>
              <View style={styles.timelineContainer}>
                {projects.map((proj) => {
                  const bullets = getBulletTexts(proj.bulletPoints);
                  const dateStr = [proj.startDate, proj.endDate].filter(Boolean).join(" – ");
                  const techList =
                    proj.techStack && proj.techStack.length > 0
                      ? proj.techStack
                      : proj.subtitle
                      ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean)
                      : [];

                  return (
                    <View key={proj.id} style={styles.timelineEntry}>
                      <View style={[styles.timelineNode, { borderColor: accentColor }]} />
                      {dateStr ? <Text style={styles.entryDate}>{dateStr}</Text> : null}
                      <Text style={styles.entryTitle}>
                        {proj.title || (proj as any).name}
                        {techList.length > 0 ? ` (${techList.join(", ")})` : ""}
                      </Text>
                      {bullets.length > 0 && (
                        <View style={{ marginTop: 2 }}>
                          {bullets.map((bp, i) => (
                            <View key={i} style={styles.entryBulletRow}>
                              <Text style={styles.entryBulletDot}>•</Text>
                              <Text style={styles.entryBulletText}>{stripMarkdown(bp)}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Custom Sections */}
          {customSections.map((sec) => (
            <View key={sec.id}>
              <Text style={styles.mainSectionTitle}>{sec.title}</Text>
              <View style={styles.timelineContainer}>
                {sec.items.map((item) => {
                  const bullets = getBulletTexts(item.bulletPoints);
                  return (
                    <View key={item.id} style={styles.timelineEntry}>
                      <View style={[styles.timelineNode, { borderColor: accentColor }]} />
                      <Text style={styles.entryTitle}>{item.title}</Text>
                      {item.subtitle ? (
                        <Text style={styles.entryCompany}>{item.subtitle}</Text>
                      ) : null}
                      {bullets.length > 0 && (
                        <View style={{ marginTop: 2 }}>
                          {bullets.map((bp, i) => (
                            <View key={i} style={styles.entryBulletRow}>
                              <Text style={styles.entryBulletDot}>•</Text>
                              <Text style={styles.entryBulletText}>{stripMarkdown(bp)}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
