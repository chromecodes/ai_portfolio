export interface FutureBadge {
    id: string;
    label: string;
    title: string;
    icon: string;
    color: string;
    bgColor: string;
}

export interface FutureVector {
    id: string;
    index_label: string;
    tag: string;
    title: string;
    why: string;
    icon: string;
    tech_stack: string[];
}

export interface FutureProject {
    id: string;
    name: string;
    status: string;
    status_type: "progress" | "rnd" | string;
    icon: string;
    problem: string;
    stack: string[];
    highlights: string[];
}

export interface FuturePageData {
    meta: {
        badge: string;
        title_part1: string;
        title_part2: string;
        subtitle: string;
        vision_pillars: string[];
    };
    telemetry: {
        section_title: string;
        badges: FutureBadge[];
    };
    vectors: {
        section_tag: string;
        section_title: string;
        section_subtitle: string;
        focus_tech_label: string;
        items: FutureVector[];
    };
    pipeline: {
        section_tag: string;
        section_title: string;
        section_subtitle: string;
        core_highlights_label: string;
        tech_stack_label: string;
        projects: FutureProject[];
    };
    launchpad: {
        section_tag: string;
        section_title: string;
        section_subtitle: string;
        topic_select_label: string;
        selected_interest_prefix: string;
        default_reach_out_text: string;
        topics: string[];
        contacts: {
            email_label: string;
            email_address: string;
            github_label: string;
            github_url: string;
            linkedin_label: string;
            linkedin_url: string;
        };
    };
}
