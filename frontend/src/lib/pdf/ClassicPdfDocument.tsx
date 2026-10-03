"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown, sanitizePdfText } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 9,
    color: "#0F172A",
    lineHeight: 1.35,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 8,
  },
  fullName: {
    fontSize: 18,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 3,
    color: "#0F172A",
  },
  contactRow: {
    fontSize: 9,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#334155",
    textAlign: "center",
    marginTop: 2,
  },
  summary: {
    fontSize: 9,
    fontFamily: "Plus Jakarta Sans",
    fontStyle: "italic",
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 1.35,
  },
  section: {
    marginTop: 11,
  },
  sectionTitle: {
    fontSize: 9.75,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
    paddingBottom: 2,
    marginBottom: 5,
    color: "#0F172A",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    fontSize: 9.75,
    color: "#0F172A",
  },
  entryLocation: {
    fontSize: 9,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
  },
  entrySubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#1E293B",
    marginTop: 1,
    marginBottom: 2,
  },
  entryDegree: {
    fontFamily: "Plus Jakarta Sans",
    fontStyle: "italic",
    fontSize: 9,
    color: "#1E293B",
  },
  entryDate: {
    fontSize: 8.25,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  bulletDot: {
    width: 13,
    fontSize: 9,
    color: "#475569",
  },
  bulletText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.4,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 9,
  },
  skillCategory: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    width: 135,
    color: "#0F172A",
    fontSize: 9,
  },
  skillText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#334155",
    fontSize: 9,
    lineHeight: 1.35,
  },
});

export function ClassicPdfDocument({ data }: { data: CVData }) {
  const { personalInfo } = data;
  const education = getSectionItems(data, "EDUCATION");
  const experience = getSectionItems(data, "EXPERIENCE");
  const projects = getSectionItems(data, "PROJECTS");
  const customSections = (data.sections || []).filter(
    (s) => s.sectionType === "CUSTOM" && s.isVisible !== false && s.items && s.items.length > 0
  );
  const skillGroups = data.skillGroups && data.skillGroups.length > 0
    ? data.skillGroups
    : (data.skills || []);

  return (
    <Document title={`${personalInfo.fullName || "Resume"} - CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
          <Text style={styles.contactRow}>
            {[
              personalInfo.phone,
              personalInfo.email,
              personalInfo.location,
              personalInfo.linkedinUrl,
              personalInfo.githubUrl,
            ]
              .filter(Boolean)
              .join("   •   ")}
          </Text>
          {personalInfo.summary ? (
            <Text style={styles.summary}>{sanitizePdfText(personalInfo.summary)}</Text>
          ) : null}
        </View>

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              return (
                <View key={edu.id} style={{ marginBottom: 4 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {edu.subtitle || (edu as any).institution || "University Name"}
                    </Text>
                    <Text style={styles.entryLocation}>{edu.location}</Text>
                  </View>
                  <View style={styles.entrySubHeader}>
                    <Text style={styles.entryDegree}>
                      {edu.title || (edu as any).degree}
                      {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                    </Text>
                    <Text style={styles.entryDate}>
                      {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                    </Text>
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

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              return (
                <View key={exp.id} style={{ marginBottom: 5 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {exp.subtitle || (exp as any).company || "Company Name"}
                    </Text>
                    <Text style={styles.entryLocation}>{exp.location}</Text>
                  </View>
                  <View style={styles.entrySubHeader}>
                    <Text style={styles.entryDegree}>{exp.title || (exp as any).role}</Text>
                    <Text style={styles.entryDate}>
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </Text>
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic &amp; Technical Projects</Text>
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const techList = proj.techStack && proj.techStack.length > 0
                ? proj.techStack
                : proj.subtitle ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean) : [];
              return (
                <View key={proj.id} style={{ marginBottom: 5 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {proj.title || (proj as any).name}
                      {techList.length > 0 ? ` | ${techList.join(", ")}` : ""}
                    </Text>
                    <Text style={styles.entryLocation}>
                      {proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : ""}
                    </Text>
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

        {/* Technical Skills */}
        {skillGroups && skillGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {skillGroups
              .filter(
                (cat) =>
                  cat.categoryName &&
                  cat.skills &&
                  cat.skills.some((s) => s.trim().length > 0)
              )
              .map((cat) => (
                <View key={cat.id} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>{cat.categoryName}:</Text>
                  <Text style={styles.skillText}>
                    {cat.skills.filter((s) => s.trim().length > 0).join(", ")}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Custom Sections */}
        {customSections.map((sec) => (
          <View key={sec.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            {sec.items.map((item) => {
              const bullets = getBulletTexts(item.bulletPoints);
              return (
                <View key={item.id} style={{ marginBottom: 4 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{item.title}</Text>
                    {(item.location || item.url) && (
                      <Text style={styles.entryLocation}>{item.location || item.url}</Text>
                    )}
                  </View>
                  {item.subtitle && (
                    <View style={styles.entrySubHeader}>
                      <Text>{item.subtitle}</Text>
                      {(item.startDate || item.endDate) && (
                        <Text>
                          {item.startDate} {item.endDate ? `– ${item.isCurrent ? "Present" : item.endDate}` : ""}
                        </Text>
                      )}
                    </View>
                  )}
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
