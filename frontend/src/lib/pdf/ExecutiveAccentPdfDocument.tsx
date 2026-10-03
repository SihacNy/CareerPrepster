"use client";

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown, sanitizePdfText } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 38,
    paddingHorizontal: 40,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 8.75,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    lineHeight: 1.35,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    marginRight: 20,
    position: "relative",
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarBorderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3.5,
  },
  avatarInitials: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  initialsText: {
    fontSize: 20,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
  },
  headerContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  nameWrapper: {
    marginBottom: 2,
  },
  fullName: {
    fontSize: 20,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 1.15,
  },
  roleWrapper: {
    marginBottom: 3,
  },
  targetRole: {
    fontSize: 9.5,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#334155",
    lineHeight: 1.25,
  },
  dividerRule: {
    width: "100%",
    height: 1.5,
    marginBottom: 4,
  },
  contactRow: {
    fontSize: 8.25,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
    lineHeight: 1.3,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    marginBottom: 10,
  },
  sectionTitleText: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginRight: 15,
  },
  sectionTitleRule: {
    flex: 1,
    height: 1.5,
  },
  summaryText: {
    fontSize: 8.5,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
    lineHeight: 1.4,
    textAlign: "justify",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3.5,
  },
  entryTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9.25,
    color: "#1E293B",
  },
  entryLocation: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.25,
    color: "#64748B",
  },
  entrySeparator: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#94A3B8",
  },
  entrySubtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    fontSize: 8.625,
    color: "#475569",
  },
  entryDate: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 600,
    fontStyle: "italic",
    fontSize: 8.25,
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 2,
    marginBottom: 3.5,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2.5,
  },
  bulletDot: {
    width: 13,
    fontSize: 8.5,
    color: "#475569",
  },
  bulletText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.5,
    color: "#475569",
    lineHeight: 1.4,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2.5,
    fontSize: 8.5,
  },
  skillCategory: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    width: 120,
    color: "#1E293B",
    fontSize: 8.5,
  },
  skillText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
    fontSize: 8.5,
    lineHeight: 1.35,
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
    .join("  |  ");

  return (
    <Document title={`${personalInfo.fullName || "Resume"} - Executive CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header with Photo and Info */}
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            {photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0 ? (
              <View style={{ width: 84, height: 84, position: "relative" }}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={photoUrl} style={styles.avatarImage} />
                <View style={[styles.avatarBorderOverlay, { borderColor: accentColor }]} />
              </View>
            ) : (
              <View style={[styles.avatarInitials, { borderColor: accentColor }]}>
                <Text style={[styles.initialsText, { color: accentColor }]}>{initials}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerContent}>
            <View style={styles.nameWrapper}>
              <Text style={[styles.fullName, { color: accentColor }]}>
                {personalInfo.fullName || "Richard Sanchez"}
              </Text>
            </View>
            {data.targetRole ? (
              <View style={styles.roleWrapper}>
                <Text style={styles.targetRole}>{data.targetRole}</Text>
              </View>
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
            <Text style={styles.summaryText}>{sanitizePdfText(personalInfo.summary)}</Text>
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
                <View key={edu.id} style={{ marginBottom: 5.5 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {edu.title || (edu as any).degree || edu.subtitle || (edu as any).institution}
                      {(edu.title || (edu as any).degree) && (edu.subtitle || (edu as any).institution) ? (
                        <>
                          <Text style={styles.entrySeparator}>{"   |   "}</Text>
                          <Text>{edu.subtitle || (edu as any).institution}</Text>
                        </>
                      ) : null}
                      {edu.location ? (
                        <Text style={styles.entryLocation}>{`   (${edu.location})`}</Text>
                      ) : null}
                      {edu.gpa ? (
                        <Text style={styles.entryLocation}>{`   •   GPA: ${edu.gpa}`}</Text>
                      ) : null}
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
                <View key={exp.id} style={{ marginBottom: 5.5 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {exp.title || (exp as any).role}
                      {(exp.subtitle || (exp as any).company) ? (
                        <>
                          <Text style={styles.entrySeparator}>{"   |   "}</Text>
                          <Text>{exp.subtitle || (exp as any).company}</Text>
                        </>
                      ) : null}
                      {exp.location ? (
                        <Text style={styles.entryLocation}>{`   (${exp.location})`}</Text>
                      ) : null}
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
                <View key={proj.id} style={{ marginBottom: 5.5 }}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryTitle}>
                      {proj.title || (proj as any).name}
                      {techList.length > 0 ? (
                        <>
                          <Text style={styles.entrySeparator}>{"   |   "}</Text>
                          <Text style={styles.entryLocation}>{techList.join(", ")}</Text>
                        </>
                      ) : null}
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
