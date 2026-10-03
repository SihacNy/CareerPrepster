"use client";

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown, sanitizePdfText } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 8.5,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebar: {
    width: "34%",
    padding: 20,
    color: "#FFFFFF",
  },
  main: {
    width: "66%",
    padding: 22,
    color: "#0F172A",
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignSelf: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
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
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
  },
  sidebarSection: {
    marginBottom: 16,
  },
  sidebarTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9.75,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "rgba(255, 255, 255, 0.35)",
    paddingBottom: 2.5,
    marginBottom: 7,
    color: "#FFFFFF",
  },
  contactField: {
    marginBottom: 6.5,
  },
  contactLabel: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  contactValue: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.25,
    color: "#E2E8F0",
    marginTop: 1.5,
  },
  eduItem: {
    marginBottom: 9,
  },
  eduDate: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    fontSize: 7.875,
    color: "#CBD5E1",
  },
  eduDegree: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 8.625,
    color: "#FFFFFF",
    marginTop: 1.5,
    lineHeight: 1.25,
  },
  eduInstitution: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 7.875,
    color: "#E2E8F0",
    marginTop: 0.5,
  },
  eduGpa: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 7.5,
    fontStyle: "italic",
    color: "#CBD5E1",
    marginTop: 0.5,
  },
  eduBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    marginLeft: 2,
  },
  eduBulletDot: {
    width: 7,
    fontSize: 7.5,
    color: "#CBD5E1",
  },
  eduBulletText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 7.875,
    color: "#E2E8F0",
    lineHeight: 1.35,
  },
  skillCategoryTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 7.5,
    textTransform: "uppercase",
    color: "#CBD5E1",
    marginTop: 3,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  skillBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3.5,
  },
  skillBulletDot: {
    width: 8,
    fontSize: 8.25,
    color: "#FFFFFF",
  },
  skillBulletText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 500,
    fontSize: 8.25,
    color: "#F1F5F9",
    lineHeight: 1.35,
  },
  candidateName: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 800,
    fontSize: 20,
    textTransform: "uppercase",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  candidateRole: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    fontSize: 9.5,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#475569",
    marginTop: 3,
  },
  summaryText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.25,
    lineHeight: 1.5,
    color: "#475569",
    marginTop: 6,
    textAlign: "justify",
  },
  mainSectionTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9.75,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#1E293B",
    borderBottomWidth: 1.5,
    borderBottomColor: "#334155",
    paddingBottom: 2.5,
    marginTop: 14,
    marginBottom: 10,
  },
  timelineContainer: {
    position: "relative",
    paddingLeft: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: "#CBD5E1",
    marginLeft: 4,
  },
  timelineEntry: {
    position: "relative",
    marginBottom: 14,
  },
  timelineNode: {
    position: "absolute",
    left: -21,
    top: 1.5,
    width: 8.5,
    height: 8.5,
    borderRadius: 4.25,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  entryDate: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 8.25,
    color: "#1E293B",
  },
  entryCompany: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    fontSize: 8.25,
    color: "#475569",
    marginTop: 1.5,
  },
  entryTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9,
    color: "#0F172A",
    marginTop: 1.5,
  },
  entryAchievementText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.25,
    color: "#475569",
    lineHeight: 1.42,
    marginBottom: 3,
    textAlign: "justify",
  },
  projectTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 1.5,
  },
  projectTechText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 7.875,
    color: "#64748B",
    marginLeft: 5,
  },
  projectUrlText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 7.5,
    color: "#64748B",
    marginTop: 1.5,
    marginBottom: 3,
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
            {photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0 ? (
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
            {personalInfo.githubUrl ? (
              <View style={styles.contactField}>
                <Text style={styles.contactLabel}>GitHub</Text>
                <Text style={styles.contactValue}>
                  {personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
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
                const bullets = getBulletTexts(edu.bulletPoints).filter(
                  (b) => b && b.trim() && b.trim() !== "."
                );
                return (
                  <View key={edu.id} style={styles.eduItem}>
                    {dateStr ? <Text style={styles.eduDate}>{dateStr}</Text> : null}
                    <Text style={styles.eduDegree}>{edu.title || (edu as any).degree}</Text>
                    <Text style={styles.eduInstitution}>
                      {edu.subtitle || (edu as any).institution}
                      {edu.location ? `, ${edu.location}` : ""}
                    </Text>
                    {edu.gpa ? <Text style={styles.eduGpa}>GPA: {edu.gpa}</Text> : null}
                    {bullets.length > 0 ? (
                      <View style={{ marginTop: 2 }}>
                        {bullets.map((b, i) => (
                          <View key={i} style={styles.eduBulletRow}>
                            <Text style={styles.eduBulletDot}>•</Text>
                            <Text style={styles.eduBulletText}>{stripMarkdown(b)}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {/* Section: Expertise */}
          {skillGroups && skillGroups.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Expertise</Text>
              {skillGroups.map((group) => {
                const skillsArr = Array.isArray(group.skills)
                  ? group.skills.filter(Boolean).map(String)
                  : typeof group.skills === "string"
                    ? (group.skills as string).split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
                return (
                  <View key={group.id} style={{ marginBottom: 5 }}>
                    {group.categoryName ? (
                      <Text style={styles.skillCategoryTitle}>{group.categoryName}</Text>
                    ) : null}
                    {skillsArr.map((skill, idx) => (
                      <View key={idx} style={styles.skillBulletRow}>
                        <Text style={styles.skillBulletDot}>•</Text>
                        <Text style={styles.skillBulletText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
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
              <Text style={styles.summaryText}>{sanitizePdfText(personalInfo.summary)}</Text>
            ) : null}
          </View>

          {/* Experience Section */}
          {experience && experience.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>Experience</Text>
              <View style={styles.timelineContainer}>
                {experience.map((exp) => {
                  const bullets = getBulletTexts(exp.bulletPoints).filter(
                    (b) => b && b.trim() && b.trim() !== "." && b.trim() !== "-"
                  );
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
                            <Text key={i} style={styles.entryAchievementText}>
                              {stripMarkdown(bp)}
                            </Text>
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
                  const bullets = getBulletTexts(proj.bulletPoints).filter(
                    (b) => b && b.trim() && b.trim() !== "." && b.trim() !== "-"
                  );
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
                      <View style={styles.projectTitleRow}>
                        <Text style={styles.entryTitle}>
                          {proj.title || (proj as any).name}
                        </Text>
                        {techList.length > 0 ? (
                          <Text style={[styles.projectTechText, { marginLeft: 5 }]}>
                            {`(${techList.join(", ")})`}
                          </Text>
                        ) : null}
                      </View>
                      {(proj.url || (proj as any).linkUrl) ? (
                        <Text style={styles.projectUrlText}>
                          {proj.url || (proj as any).linkUrl}
                        </Text>
                      ) : null}
                      {bullets.length > 0 && (
                        <View style={{ marginTop: 2 }}>
                          {bullets.map((bp, i) => (
                            <Text key={i} style={styles.entryAchievementText}>
                              {stripMarkdown(bp)}
                            </Text>
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
                  const bullets = getBulletTexts(item.bulletPoints).filter(
                    (b) => b && b.trim() && b.trim() !== "." && b.trim() !== "-"
                  );
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
                            <Text key={i} style={styles.entryAchievementText}>
                              {stripMarkdown(bp)}
                            </Text>
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
