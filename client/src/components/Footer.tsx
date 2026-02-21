import { APP_TITLE } from "@/const";
import { Github, Mail, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Footer() {
  const [, setLocation] = useLocation();

  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Documentation",
      links: [
        { label: "Getting Started", href: "/docs/getting-started" },
        { label: "API Reference", href: "/api/docs" },
        { label: "Guides", href: "/docs/guides" },
        { label: "Examples", href: "/docs/examples" },
      ],
    },
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Status", href: "https://status.example.com", external: true },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
        { label: "Support", href: "/support" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Security", href: "/security" },
      ],
    },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      setLocation(href);
    }
  };

  return (
    <footer className="bg-background border-t mt-20">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-4">{APP_TITLE}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Enterprise SaaS backend for managing users, workspaces, and automation.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/bl1nk-bot/bl1nkbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@example.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {APP_TITLE}. All rights reserved.
          </p>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm">
            <button
              onClick={() => setLocation("/privacy")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => setLocation("/terms")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => setLocation("/api/docs")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              API Docs
            </button>
            <a
              href="https://status.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Status
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
