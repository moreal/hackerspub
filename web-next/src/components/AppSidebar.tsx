import { type Uuid, validateUuid } from "@hackerspub/models/uuid";
import { A } from "@solidjs/router";
import { graphql } from "relay-runtime";
import { Show } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { createFragment, createMutation } from "solid-relay";
import { deleteCookie, getCookie, getRequestProtocol } from "vinxi/http";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar.tsx";
import { useLingui } from "~/lib/i18n/macro.d.ts";
import { Trans } from "./Trans.tsx";
import type { AppSidebarSignOutMutation } from "./__generated__/AppSidebarSignOutMutation.graphql.ts";
import { AppSidebar_signedAccount$key } from "./__generated__/AppSidebar_signedAccount.graphql.ts";
import { Avatar, AvatarImage } from "./ui/avatar.tsx";

const AppSidebarSignOutMutation = graphql`
  mutation AppSidebarSignOutMutation($sessionId: UUID!) {
    revokeSession(sessionId: $sessionId) {
      id
    }
  }
`;

async function removeSessionCookie(): Promise<Uuid | null> {
  "use server";
  const event = getRequestEvent();
  if (event != null) {
    const sessionId = getCookie(event.nativeEvent, "session");
    deleteCookie(event.nativeEvent, "session", {
      httpOnly: true,
      path: "/",
      secure: getRequestProtocol(event.nativeEvent) === "https",
    });
    if (sessionId != null && validateUuid(sessionId)) {
      return sessionId;
    }
  }
  return null;
}

export interface AppSidebarProps {
  $signedAccount?: AppSidebar_signedAccount$key | null;
  signedAccountLoaded?: boolean;
}

export function AppSidebar(props: AppSidebarProps) {
  const { t } = useLingui();
  const signedAccount = createFragment(
    graphql`
      fragment AppSidebar_signedAccount on Account {
        name
        username
        avatarUrl
      }
    `,
    () => props.$signedAccount,
  );
  const [signOut] = createMutation<AppSidebarSignOutMutation>(
    AppSidebarSignOutMutation,
  );

  async function onSignOut() {
    const sessionId = await removeSessionCookie();
    if (sessionId != null) {
      signOut({
        variables: { sessionId },
        onCompleted() {
          location.reload(); // FIXME: Use a more graceful reload method
        },
        onError(error) {
          window.alert(
            t`Failed to sign out: ${error.message}`,
          );
        },
      });
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 class="font-bold m-2">{t`Hackers' Pub`}</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t`Timeline`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem class="list-none">
              <SidebarMenuButton as={A} href="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                  />
                </svg>
                {t`Feed`}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem class="list-none">
              <SidebarMenuButton as={A} href="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>

                {t`Hackers' Pub`}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem class="list-none">
              <SidebarMenuButton as={A} href="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                {t`Fediverse`}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem class="list-none">
              <SidebarMenuButton as={A} href="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z"
                  />
                </svg>
                {t`Without shares`}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem class="list-none">
              <SidebarMenuButton as={A} href="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                {t`Articles only`}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t`Account`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Show when={props.signedAccountLoaded && !signedAccount()}>
              {(_) => (
                <SidebarMenuItem class="list-none">
                  <SidebarMenuButton
                    as={A}
                    href={`/sign?next=${
                      encodeURIComponent(location?.href ?? "/")
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                      />
                    </svg>
                    {t`Sign in`}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </Show>
            <Show when={props.signedAccountLoaded && signedAccount()}>
              {(signedAccount) => (
                <>
                  <SidebarMenuItem class="list-none">
                    <SidebarMenuButton
                      as={A}
                      href={`/@${signedAccount().username}`}
                    >
                      <Avatar class="size-4">
                        <AvatarImage
                          src={signedAccount().avatarUrl}
                          width={16}
                          height={16}
                        />
                      </Avatar>
                      {signedAccount().name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem class="list-none">
                    <SidebarMenuButton
                      on:click={onSignOut}
                      class="cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                        />
                      </svg>
                      {t`Sign out`}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </Show>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p class="m-2 mb-0 text-sm underline">
          <a href="/coc">{t`Code of conduct`}</a>
        </p>
        <p class="m-2 text-sm">
          <Trans
            message={t`The source code of this website is available on ${"GITHUB_REPOSITORY"} under the ${"AGPL-3.0"} license.`}
            values={{
              GITHUB_REPOSITORY: () => (
                <a
                  href="https://github.com/hackers-pub/hackerspub"
                  target="_blank"
                  class="underline"
                >
                  {t`GitHub repository`}
                </a>
              ),
              "AGPL-3.0": () => (
                <a
                  href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                  target="_blank"
                  class="underline"
                >
                  AGPL 3.0
                </a>
              ),
            }}
          />
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
