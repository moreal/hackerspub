import { compactUrl } from "@hackerspub/models/url";
import { graphql } from "relay-runtime";
import { For, Show } from "solid-js";
import { createFragment } from "solid-relay";
import { Avatar, AvatarImage } from "~/components/ui/avatar.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip.tsx";
import { msg, plural, useLingui } from "~/lib/i18n/macro.d.ts";
import type { ProfileCard_account$key } from "./__generated__/ProfileCard_account.graphql.ts";
import { Timestamp } from "./Timestamp.tsx";
import { Trans } from "./Trans.tsx";

export interface ProfileCardProps {
  $account: ProfileCard_account$key;
}

export function ProfileCard(props: ProfileCardProps) {
  const { t, i18n } = useLingui();
  const account = createFragment(
    graphql`
      fragment ProfileCard_account on Account {
        name
        username
        avatarUrl
        actor {
          instanceHost
          bio
          followeesCount: followees {
            totalCount
          }
          followersCount: followers {
            totalCount
          }
          followsViewer
        }
        links {
          name
          handle
          icon
          url
          verified
        }
      }
    `,
    () => props.$account,
  );

  return (
    <Show when={account()}>
      {(account) => (
        <>
          <div class="p-4">
            <div class="flex items-center gap-4 mx-auto max-w-prose">
              <Avatar class="size-16">
                <a href={`/@${account().username}`}>
                  <AvatarImage src={account().avatarUrl} class="size-16" />
                </a>
              </Avatar>
              <div>
                <h1 class="text-xl font-semibold">{account().name}</h1>
                <div class="text-muted-foreground">
                  <span class="select-all">
                    @{account().username}@{account().actor.instanceHost}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Show when={(account().actor.bio?.trim() ?? "") !== ""}>
            <div class="p-4 pt-0">
              <div
                innerHTML={account().actor.bio ?? ""}
                class="mx-auto prose dark:prose-invert"
              />
            </div>
          </Show>
          <Show when={account().links.length > 0}>
            <div class="p-4 pt-0">
              <ul class="mx-auto max-w-prose">
                <For each={account().links}>
                  {(link) => (
                    <li class="flex flex-row items-center text-sm mb-1">
                      <img
                        src={`/icons/${link.icon.toLowerCase()}.svg`}
                        class="size-3.5 mr-1 dark:invert opacity-65"
                      />
                      <span class="text-muted-foreground mr-1">
                        {link.name}
                      </span>
                      <a href={link.url}>
                        {link.handle ?? compactUrl(link.url)}
                      </a>
                      <Show when={link.verified}>
                        {(verified) => (
                          <Tooltip>
                            <TooltipTrigger>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-4 ml-1 stroke-success-foreground cursor-help"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                                />
                              </svg>
                            </TooltipTrigger>
                            <TooltipContent>
                              <Trans
                                message={t`Verified that this link is owned by ${"OWNER"} ${"RELATIVE_TIME"}`}
                                values={{
                                  OWNER: () => <strong>{account().name}
                                  </strong>,
                                  RELATIVE_TIME: () => (
                                    <Timestamp value={verified()} />
                                  ),
                                }}
                              />
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>
          <div class="p-4 pt-0 border-b">
            <div class="mx-auto max-w-prose text-muted-foreground">
              <a>
                {i18n._(
                  msg`${
                    plural(account().actor.followeesCount.totalCount, {
                      one: "# following",
                      other: "# following",
                    })
                  }`,
                )}
              </a>{" "}
              &middot;{" "}
              <a href={`/@${account().username}/followers`}>
                {i18n._(
                  msg`${
                    plural(account().actor.followersCount.totalCount, {
                      one: "# follower",
                      other: "# followers",
                    })
                  }`,
                )}
              </a>
              <Show when={account().actor.followsViewer}>
                {" "}
                &middot; {t`Following you`}
              </Show>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}
