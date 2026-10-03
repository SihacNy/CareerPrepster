"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CVData, getSectionItems, getBulletTexts } from "@/types/cv";
import { stripMarkdown } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 9.375,
    color: "#0F172A",
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 6,
  },
  fullName: {
    fontSize: 18,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 800,
    marginBottom: 3,
    color: "#0F172A",
  },
  contactRow: {
    fontSize: 8.625,
    fontFamily: "Courier",
    color: "#475569",
    marginTop: 2,
  },
  section: {
    marginTop: 9,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
    paddingBottom: 1.5,
    marginBottom: 4,
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
    fontSize: 9.375,
    color: "#0F172A",
  },
  entryLocation: {
    fontSize: 8.625,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#475569",
  },
  entrySubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.625,
    color: "#1E293B",
    marginBottom: 2,
    marginTop: 1,
  },
  entrySubtitle: {
    fontSize: 8.625,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 500,
    color: "#1E293B",
  },
  entryDate: {
    fontSize: 8.25,
    fontFamily: "Courier",
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
    fontSize: 8.625,
    color: "#475569",
  },
  bulletText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    fontSize: 8.625,
    color: "#334155",
    lineHeight: 1.4,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2.5,
    fontSize: 8.625,
  },
  skillCategory: {
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    width: 140,
    color: "#0F172A",
    fontSize: 8.625,
  },
  skillText: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 400,
    color: "#334155",
    fontSize: 8.625,
    lineHeight: 1.35,
  },
});

export function ModernPdfDocument({ data }: { data: CVData }) {
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
    <Document title={`${personalInfo.fullName || "Resume"} - Tech CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header - Left Aligned */}
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
              .join("   |   ")}
          </Text>
        </View>

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => {
              const bullets = getBulletTexts(edu.bulletPoints);
              return (
                <View key={edu.id} style={{ marginBottom: 3 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {edu.subtitle || (edu as any).institution}
                    </Text>
                    <Text style={styles.entryLocation}>{edu.location}</Text>
                  </View>
                  <View style={styles.entrySubHeader}>
                    <Text>
                      {edu.title || (edu as any).degree}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                    </Text>
                    <Text>
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
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => {
              const bullets = getBulletTexts(exp.bulletPoints);
              return (
                <View key={exp.id} style={{ marginBottom: 4 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {exp.subtitle || (exp as any).company}
                    </Text>
                    <Text style={styles.entryLocation}>{exp.location}</Text>
                  </View>
                  <View style={styles.entrySubHeader}>
                    <Text>{exp.title || (exp as any).role}</Text>
                    <Text>
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
            <Text style={styles.sectionTitle}>Technical Projects</Text>
            {projects.map((proj) => {
              const bullets = getBulletTexts(proj.bulletPoints);
              const techList = proj.techStack && proj.techStack.length > 0
                ? proj.techStack
                : proj.subtitle ? proj.subtitle.split(",").map((s) => s.trim()).filter(Boolean) : [];
              return (
                <View key={proj.id} style={{ marginBottom: 4 }}>
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
