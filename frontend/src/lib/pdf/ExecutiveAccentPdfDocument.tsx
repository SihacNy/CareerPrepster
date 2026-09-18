"use client";

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 2.5,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  avatarInitials: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  headerContent: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  targetRole: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#334155",
    marginTop: 1,
  },
  dividerRule: {
    width: "100%",
    height: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  contactRow: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#475569",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginRight: 6,
  },
  sectionTitleRule: {
    flex: 1,
    height: 1,
  },
  summaryText: {
    fontSize: 8,
    color: "#475569",
    lineHeight: 1.35,
    textAlign: "justify",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1.5,
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#1E293B",
  },
  entrySubtitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#475569",
  },
  entryDate: {
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 1,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 7,
    fontSize: 7,
    color: "#475569",
  },
  bulletText: {
    flex: 1,
    fontSize: 7.8,
    color: "#475569",
    lineHeight: 1.3,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 7.8,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    width: 120,
    color: "#1E293B",
  },
  skillText: {
    flex: 1,
    color: "#475569",
  },
});

export function ExecutiveAccentPdfDocument({ data }: { data: CVData }) {
  const { personalInfo } = data;
  const accentColor = data.accentColor || "#1d58ba";
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

  const contactString = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedinUrl ? personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
    personalInfo.portfolioUrl ? personalInfo.portfolioUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
    personalInfo.githubUrl ? personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?/, "") : "",
  ]
    .filter(Boolean)
    .join("   |   ");

  return (
    <Document title={`${personalInfo.fullName || "Resume"} - Executive CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header with Photo and Info */}
        <View style={styles.headerRow}>
          <View style={[styles.avatarContainer, { borderColor: accentColor }]}>
            {photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0 ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={photoUrl} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={[styles.initialsText, { color: accentColor }]}>{initials}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerContent}>
            <Text style={[styles.fullName, { color: accentColor }]}>
              {personalInfo.fullName || "Richard Sanchez"}
            </Text>
            {data.targetRole ? (
              <Text style={styles.targetRole}>{data.targetRole}</Text>
            ) : null}
            {/* Consistent Accent Color Divider Line */}
            <View style={[styles.dividerRule, { backgroundColor: accentColor }]} />
            <Text style={styles.contactRow}>{contactString}</Text>
          </View>
        </View>

        {/* Profile Summary */}
        {personalInfo.summary ? (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                PROFILE SUMMARY
              </Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        ) : null}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>EDUCATION</Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              const dateStr = [edu.startDate, edu.isCurrent ? "PRESENT" : edu.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();
              return (
                <View key={edu.id} style={{ marginBottom: 3 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {edu.title || (edu as any).degree || edu.subtitle || (edu as any).institution}
                      {(edu.title || (edu as any).degree) && (edu.subtitle || (edu as any).institution)
                        ? `  |  ${edu.subtitle || (edu as any).institution}`
                        : ""}
                      {edu.location ? ` (${edu.location})` : ""}
                      {edu.gpa ? `  •  GPA: ${edu.gpa}` : ""}
                    </Text>
                    {dateStr ? (
                      <Text style={[styles.entryDate, { color: accentColor }]}>
                        {dateStr}
                      </Text>
                    ) : null}
                  </View>
                  {bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {bullets.map((bp, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                WORK EXPERIENCE
              </Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              const dateStr = [exp.startDate, exp.isCurrent ? "PRESENT" : exp.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();
              return (
                <View key={exp.id} style={{ marginBottom: 3 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {exp.title || (exp as any).role}
                      {(exp.subtitle || (exp as any).company)
                        ? `  |  ${exp.subtitle || (exp as any).company}`
                        : ""}
                      {exp.location ? ` (${exp.location})` : ""}
                    </Text>
                    {dateStr ? (
                      <Text style={[styles.entryDate, { color: accentColor }]}>
                        {dateStr}
                      </Text>
                    ) : null}
                  </View>
                  {bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {bullets.map((bp, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                KEY PROJECTS
              </Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const dateStr = [proj.startDate, proj.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();
              const techList =
                proj.techStack && proj.techStack.length > 0
                  ? proj.techStack
                  : proj.subtitle
                  ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean)
                  : [];
              return (
                <View key={proj.id} style={{ marginBottom: 3 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {proj.title || (proj as any).name}
                      {techList.length > 0 ? `  |  ${techList.join(", ")}` : ""}
                    </Text>
                    {dateStr ? (
                      <Text style={[styles.entryDate, { color: accentColor }]}>
                        {dateStr}
                      </Text>
                    ) : null}
                  </View>
                  {bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {bullets.map((bp, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Skills */}
        {skillGroups && skillGroups.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                SKILLS &amp; EXPERTISE
              </Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            {skillGroups.map((group) => {
              const skillsStr = Array.isArray(group.skills)
                ? group.skills.filter(Boolean).map(String).join(", ")
                : typeof group.skills === "string"
                ? group.skills
                : "";
              return (
                <View key={group.id} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>{group.categoryName}:</Text>
                  <Text style={styles.skillText}>{skillsStr}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Custom Sections */}
        {customSections.map((sec) => (
          <View key={sec.id} style={{ marginBottom: 4 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                {(sec.title || sec.customTitle || "CUSTOM SECTION").toUpperCase()}
              </Text>
              <View style={[styles.sectionTitleRule, { backgroundColor: accentColor }]} />
            </View>
            {(sec.items || []).map((item) => {
              const bullets = getBulletTexts(item.bulletPoints);
              const dateStr = [item.startDate, item.isCurrent ? "PRESENT" : item.endDate]
                .filter(Boolean)
                .join(" – ")
                .toUpperCase();
              return (
                <View key={item.id} style={{ marginBottom: 3 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>{item.title || ""}</Text>
                    {dateStr ? (
                      <Text style={[styles.entryDate, { color: accentColor }]}>
                        {dateStr}
                      </Text>
                    ) : null}
                  </View>
                  {item.subtitle ? (
                    <Text style={{ fontSize: 7.5, color: "#64748B" }}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                  {bullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {bullets.map((bp, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
}
